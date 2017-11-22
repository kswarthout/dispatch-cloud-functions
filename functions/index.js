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




