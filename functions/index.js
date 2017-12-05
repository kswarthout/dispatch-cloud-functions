const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

/**
 * Triggers when a user changes their current team selection.
 * Adds user to teamMembers node of team matching the ID selected.
 * 
 * Test Case: addUserToTeam({before: 'none', after: 'MCT2' }, {params: {userID: 'lv0lw1hvTccn3aAY71BocbjkBhT2'}})
 */
exports.addUserToTeam = functions.database.ref('users/{userID}/currentTeam').onWrite(event => {

  //TEAM VARIABLES
  const teamID = event.data.val();
  const teamMembersRef = event.data.adminRef.parent.parent.parent.child('teams').child(teamID).child('teamMembers');

  //USER VARIABLES
  const userID = event.params.userID;
  const userRef = event.data.adminRef.parent.parent.parent.child('users').child(userID);

  if(teamID !== 'none'){

    return userRef.once('value').then(function(dataSnapshot){

      const user = dataSnapshot.val();
      event.data.adminRef.parent.parent.parent.child('teams').child(teamID).child('teamMembers').child(userID).set({
        currentRole: user.currentRole,
        currentStatus: user.currentStatus,
        currentTeam: user.currentTeam,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        latitude: user.latitude,
        longitude: user.longitude,
        phone: user.phone,
        token: user.token,
        userID: user.userID
      });
    });
  } else {

    return userRef.child('currentTeam').set('NONE');

  }
});

/**
 * Triggers when a team member's status has changed
 * Uses the most recently changes team member's status
 * to set the over all team status
 * 
 * Test Case: updateTeamStatus({before: 'Off-Duty', after: 'Active' }, {params: {teamID: 'MCT1', userID: '48dTxvDQcsX76jJ614Mayg75wpF2'}})
 */
 exports.updateTeamStatus = functions.database.ref('teams/{teamID}/teamMembers/{userID}/currentStatus').onWrite(event => {

    if(event.data.exists()){

      const status = event.data.val();
      return event.data.adminRef.parent.parent.parent.child('status').set(status);

    } else {
      return event.data.adminRef.parent.parent.parent.child('status').set('INACTIVE');
    }

 });

 /**
 * Triggers when a user updates their status
 * Looks at the user's current team, and updates their team member status accordingly
 * 
 * Test Case: syncUserStatusWithTeamMemberStatus({before: 'Active', after: 'Dispatched' }, {params: {userID: '48dTxvDQcsX76jJ614Mayg75wpF2'}})
 */
 exports.syncUserStatusWithTeamMemberStatus = functions.database
      .ref('users/{userID}/currentStatus')
      .onWrite(event => {
          const userStatus = event.data.val();
          const userRef = event.data.adminRef.parent;
          return userRef.once('value').then(function(dataSnapshot){

              //THE USER OBJECT 
              const user = dataSnapshot.val();

              if(user.currentRole === 'MCT'){
                event.data.adminRef.parent.parent.parent
                    .child('teams')
                    .child(user.currentTeam)
                    .child('teamMembers')
                    .child(user.userID)
                    .child('currentStatus')
                    .set(user.currentStatus);
              } 
              else if (user.currentRole === 'Dispatcher') {
                event.data.adminRef.parent.parent.parent.child('teams')
                              .child('dispatcher')
                              .child('status')
                              .set(user.currentStatus);
              }
          });
});

/**
 * Triggers when a team's status changes.
 * Ensures team members, their team, and corresponding user objects all have the same status
 * 
 * Test Case: syncTeamMemberStatusOnTeamStatusChange({before: 'Active', after: 'Dispatched' }, {params: {teamID: 'MCT1', userID: '48dTxvDQcsX76jJ614Mayg75wpF2'}})
 */
 exports.syncTeamMemberStatusOnTeamStatusChange = functions.database.ref('teams/{teamID}/status').onWrite(event => {

    if(event.data.exists()){

      const teamStatus = event.data.val();
      const teamRef = event.data.adminRef.parent;
      const userRef = event.data.adminRef.parent.parent.parent.child('users');

      return teamRef.child('teamMembers').once('value').then(function(dataSnapshot){
              dataSnapshot.forEach(function(childSnapshot) {
                  const userID = childSnapshot.key;
                  const updatedUser = childSnapshot.val();
                  updatedUser.currentStatus = teamStatus;
                  teamRef.child('teamMembers').child(userID).set(updatedUser);
                  userRef.child(userID).set(updatedUser);
              });
          });
    }

 });

/**
 * Triggers when a crisis is updated. If that crisis is unassigned (status =
 * open) then the users registered as part of the appropriate team (crisis
 * teamName) are notified. Tokens are stored in the team under teamMembers.
 *
 */

exports.sendCrisisNotification = functions.database.ref('/crisis/').onWrite(event => {

  //event.data.val() will contain all of the crises. I need to find the one that hasn't
  //been responded to.
  //I'm not handling the case where two crisis are registered simultaneously.

  var crisis_table_values = event.data.val();

  console.log("crisis_table_values ", crisis_table_values);
  //console.log("crisis_table_values by crisis id", crisis_table_values[crisisId]);

  for (var key in crisis_table_values){
      if (crisis_table_values[key]["status"] && crisis_table_values[key]["status"] == "open"){
        var team = crisis_table_values[key]["teamID"];
        var crisisId = crisis_table_values[key]["crisisID"];
        var crisisAddress = crisis_table_values[key]["crisisAddress"];
      }
  }

  console.log("team = ", team, "crisisId = ", crisisId);

  // Get the values at team, crisisId, and crisisAddress. I need to write this as a promise thats fulfilled
  // before the get device tokens promise

    // Get the list of device notification tokens.

  const getTeamMemberNotificationTokens = admin.database().ref(`/teams/${team}/tokens/`).once('value');

  return Promise.all([getTeamMemberNotificationsTokens]).then(results =>  {
    var teamMembers = results[0].val();
    var tokens = [];

    console.log("The first team member is ", teamMembers[0]);

    for (var key in teamMembers) {
      if (teamMembers.hasOwnProperty(key)) {
        console.log(key + " -> " + teamMembers[key]["token"]);
        tokens.push(teamMembers[key]["token"]);
      }
    }

    // Notification details.
    const payload = {
      data: {
        crisis_id: crisisId,
        crisis_address: crisisAddress
      }
    };

    // testing

    var token = 0;

    // Send notifications to all tokens.
    return admin.messaging().sendToDevice(tokens[0], payload).then(response => {
      response.results.forEach((result, index) => {
        const error = result.error;
        if (error) {
          console.error('Failure sending notification to', tokens[index], error);
          // Cleanup the tokens who are not registered anymore.
        }
      });
    });
    });
  });


