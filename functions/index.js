const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

//Test Case
//48dTxvDQcsX76jJ614Mayg75wpF2
//lv0lw1hvTccn3aAY71BocbjkBhT2
//addUserToTeam({before: null, after: 'MCT1' }, {params: {userID: '48dTxvDQcsX76jJ614Mayg75wpF2'}})
//addUserToTeam({before: 'MCT1', after: 'MCT2' }, {params: {userID: 'lv0lw1hvTccn3aAY71BocbjkBhT2'}})
// exports.addUserToTeam = functions.database.ref('users/{userID}/currentTeam').onWrite(event => {
// 	//Gets Team ID
// 	const dataSnapshot = event.data;
// 	const teamID = dataSnapshot.val();

// 	//Gets User ID
// 	const userID = event.params.userID;

// 	//Get user object
// 	return event.data.adminRef.parent.parent.child('users').child(userID).once('value').then(function(dataSnapshot){
// 		const user = dataSnapshot.val();
// 		const ref = event.data.adminRef.parent.parent.child('teams').child(teamID).child('teamMembers');
//     	// const teamUserRef = ref.child(userID);
//    		// teamUserRef.set({
//     	// 	latitude: user.latitude,
//     	// 	longitude: user.longitude,
//     	// 	status: user.currentStatus
//     	// });

//         var userLatitude = 0;
//         if(dataSnapshot.child('latitude')){
//             userLatitude = user.latitude;
//         }

//         var userLongitude = 0;
//         if(user.longitude != null){
//             userLongitude = user.longitude;
//         }

//         var userStatus = 'none';
//         if(user.currentStatus != null){
//             userStatus = user.currentStatus;
//         }

//         var userToken = 'none';
//         if(user.token != null){
//             userToken = user.token;
//         }

//         var userNotificationToken = 'none';
//         if(user.notificationToken != null){
//             userNotificationToken = user.notificationToken;
//         }

//         ref.set({
//             latitude: userLatitude,
//             longitude: userLongitude,
//             status: userStatus,
//             token: userToken,
//             notificationToken: notificationToken
//         });
    	
//     	const teamRef = event.data.adminRef.parent.parent.child('teams').child(teamID);
//     	teamRef.child('latitude').set(userLatitude);
//     	teamRef.child('longitude').set(userLongitude);
//     	teamRef.child('status').set(userStatus);
//         teamRef.child('notificationToken').set(notificationToken);
//         teamRef.child('token').set(userToken);
// 	});
// });


// exports.updateTeamOnMemberChange = functions.database.ref('teams/{teamID}/teamMembers').onWrite(event => {
//     const dataSnapshot = event.data;
//     const teamMembersRef = event.data.ref;
//     const teamMembersCount = event.data.ref.parent.child('member_count');

//     return teamMembersCount.transaction(function(current) {
//         if (event.data.exists() && !event.data.previous.exists()) {
//             return (current || 0) + 1;
//         }
//         else if (!event.data.exists() && event.data.previous.exists()) {
//             return (current || 0) - 1;
//         }
//     });

// });




