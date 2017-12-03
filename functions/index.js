const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

//Test Case
//48dTxvDQcsX76jJ614Mayg75wpF2
//lv0lw1hvTccn3aAY71BocbjkBhT2
//addUserToTeam({before: 'MCT1', after: 'MCT2' }, {params: {userID: '48dTxvDQcsX76jJ614Mayg75wpF2'}})
//addUserToTeam({before: 'MCT1', after: 'MCT2' }, {params: {userID: 'lv0lw1hvTccn3aAY71BocbjkBhT2'}})
exports.addUserToTeam = functions.database.ref('users/{userID}/currentTeam').onWrite(event => {
	//Gets Team ID
	const dataSnapshot = event.data;
	const teamID = dataSnapshot.val();

	//Gets User ID
	const userID = event.params.userID;

	//Get user object
	return event.data.adminRef.parent.parent.child('users').child(userID).once('value').then(function(dataSnapshot){
		const user = dataSnapshot.val();
		const ref = event.data.adminRef.parent.parent.child('teams').child(teamID).child('teamMembers');
    	const teamUserRef = ref.child(userID);
   		teamUserRef.set({
    		latitude: user.latitude,
    		longitude: user.longitude,
    		status: user.currentStatus
    	});

    	const teamRef = event.data.adminRef.parent.parent.child('teams').child(teamID);
    	teamRef.child('latitude').set(user.latitude);
    	teamRef.child('longitude').set(user.longitude);
    	teamRef.child('status').set(user.currentStatus);
	});
});


//Test Case
//48dTxvDQcsX76jJ614Mayg75wpF2
//lv0lw1hvTccn3aAY71BocbjkBhT2
//userRemovedFromTeam('', {params: {teamID: 'MCT2', userID: '48dTxvDQcsX76jJ614Mayg75wpF2'}})
//userRemovedFromTeam('lv0lw1hvTccn3aAY71BocbjkBhT2',{params: {teamID: 'MCT2'}})
// exports.userRemovedFromTeam = functions.database.ref('teams/{teamID}/teamMembers/{userID}').onDelete(event => {
// 	const teamRef = event.data.adminRef.parent.parent;
// 	const teamID = event.data.params.userID;
// 	return teamRef.once('value').then(function(dataSnapshot){
// 		const team = dataSnapshot.val();
// 		if(admin.database().ref('teams/'+ teamID +'/teamMembers').hasChild()){
// 			teamRef.set({
// 				status: 'Inactive',
// 				teamID: team.teamID,
// 				teamName: team.teamName
// 			});
// 		} else {

// 		}
// 	});
// });

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


