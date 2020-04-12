let app = new Vue({
    el: "#app",
    data: {
  
      url: "https://www.json-generator.com/api/json/get/bUmvTIaLpK?indent=2",
      league: [],
      games: [],
      teams: [],
      players: [],
      team: {},
      //v-model value for dates
      dateOptions: "October 6",
      //non repeated game dates
      gameDates: [],
      page: "schedulePage",
      subpage: "teamRankingContainer",
      navbarTop: true,
      loginButton: true,
      logoutButton: false,
      beforeLoginMsg: true
  
    },
  
    methods: {
  
      getData() {
        fetch(this.url, {
            method: "GET",
          })
          .then(data => {
            return data.json();
          })
          .then(myData => {
            app.league = myData.league;
            app.games = myData.games;
            app.teams = myData.teams;
            app.getAllPlayers();
            app.collectGameDates();
          })
      },
  
      //*********** SCHEDULE PAGE *********** */
      collectGameDates() {
        for (let i = 0; i < this.games.length; i++) {
          if (this.gameDates.indexOf(this.games[i]["date"]) == -1) {
            this.gameDates.push(this.games[i]["date"]);
          }
        }
      },
  
      getGamesByDate () {
        let scheduledGames = [];
        for (let i = 0; i < this.games.length; i++) {
          if (this.games[i]["date"] == this.dateOptions) {
            scheduledGames.push(this.games[i]);
          } else {
            if (this.games[i]["isCurrent"] && this.dateOptions == "Select date") {
              scheduledGames.push(this.games[i]);
            }
          }
        }
        return scheduledGames;
      },
  
      //********** STANDINGS **************/
      sortTeamsByPoints () {
        return this.teams.slice().sort((a, b)=> b.pts - a.pts)
      },
  
      getAllPlayers () {
        for (let i = 0; i < this.teams.length; i++) {
          for (let j = 0; j < this.teams[i]["players"].length; j++) {
            this.players.push(this.teams[i]["players"][j]);
          }
        }
      },
  
      sortPlayersByKey (key) {
        let sortedPlayers = this.players.slice().sort((a, b)=> b[key] - a[key]);
        return sortedPlayers.slice(0, 5);
      },
  
      findLogoForPlayer (player) {
        for (let i = 0; i < this.teams.length; i++) {
          for (let j = 0; j < this.teams[i]["players"].length; j++) {
            if (this.teams[i]["players"][j]["name"] == player) {
              return this.teams[i]["logo"];
            }
          }
        }
      },
  
      // TEAMS
      getTeam (team) {
        this.team = team;
      },
  
      displayRankingPages (id) {
        this.subpage = id;
      },
  
      showPage (pagename) {
        if (pagename == "individualTeamPage") {
          this.page = pagename;
          this.hideNav();
        } else {
          this.page = pagename;
          this.navbarTop = true;
        }
      },
  
      hideNav () {
        this.navbarTop = false;
      },
  
      login () {
        // Provider
        let provider = new firebase.auth.GoogleAuthProvider();
        // How to Log In           
        firebase.auth().signInWithPopup(provider).then( () => {
        });
      },
  
      logout () {
        firebase.auth().signOut().then(function () {
        }, error => {
          // An error happened.
          console.log(error);
        });
      },
  
      changeButtonAndMsgOnAuthState () {
        let user = firebase.auth().currentUser;
        firebase.auth().onAuthStateChanged((user)=> {
          if (user) {
            app.loginButton = false;
            app.logoutButton = true;
            let name = user.displayName;
            document.getElementById("beforeLoginMsg").innerHTML = `Welcome, ${name}`;
            document.getElementById("lock").classList.value="fas fa-lock-open fa-2x";
          } else {
            app.logoutButton = false;
            app.loginButton = true;
            document.getElementById("beforeLoginMsg").innerHTML = "Please Login below to see full content";
            document.getElementById("lock").classList.value="fas fa-lock fa-2x";
          }
        })
      },
  
      writeNewPost () {
        //get text value that user is about to send
        let text = document.getElementById("textInput").value;
        let user = firebase.auth().currentUser;
        let userName = user.displayName;
        // A post entry that wont send a message if no text there
        if (text != "" && text != " ") {
          let message = {
            messageText: text,
            name: userName,
            profileImg: user.photoURL
          }
          //delete input after sending a msg
          document.getElementById("textInput").value = "";
          // Get a key for a new Post.
          firebase.database().ref('myChat').push(message);
          //Write data
          console.log("write");
        }
      },
  
      getPosts () {
        firebase.database().ref('myChat').on('value', data => {
          let posts = document.getElementById("posts");
          posts.innerHTML = "";
          let messages = data.val();
          for (let key in messages) {
            // div that will contain photo, text and user's name
            let messageContainer = document.createElement("div");
            messageContainer.classList.add("messageContainer");
  
            let userName = document.createElement("p");
            userName.append(messages[key].name);
            userName.classList.add("userName");
  
            let photoAndTextContainer = document.createElement("div");
            photoAndTextContainer.classList.add("photoAndTextContainer");
  
            let messageText = document.createElement("p");
            messageText.append(messages[key].messageText);
            messageText.classList.add("messageText");
  
            let photo = document.createElement("img");
            photo.setAttribute("src", messages[key].profileImg);
            photo.classList.add("userPhoto");
  
            //add photo and text to their container
            photoAndTextContainer.append(photo, messageText);
            //add user name and photoAndTextContainer to messageContainer
            messageContainer.append(userName, photoAndTextContainer);
            //add everything to posts
            posts.append(messageContainer);
          }
          //scroll down to the bottom after each message
          app.scrollDown();
        })
        console.log("getting posts");
      },
  
      scrollDown () {
        document.getElementById('posts').scrollTop = document.getElementById('posts').scrollHeight
      },
  
      gotoPageIfSignedIn (page) {
        let user = firebase.auth().currentUser;
        if (user) {
            this.showPage(page);
        } else {
            // No user is signed in.
            alert("Please go to Account Page and Login to see this content!")
        }
      },
  
      makeLinkActive(linkId, activeClass){
        //when clicking on burgerMenu links need to remove active class from the bottom nav
        if(linkId == "aboutLi" || linkId =="contactLi" || linkId == "locationsLi" || linkId == "chatLi"){
          this.removeActiveClassFromLinks("scheduleLink", "standingsLink", "teamsLink", "accountLink", "bottomNavActiveLink");
          this.removeActiveClassFromLinks("aboutLi", "contactLi", "locationsLi", "chatLi", "active");
        }//when we click on the bottomNav link clear active class from the burger menu links
        else if(linkId =="scheduleLink" || linkId == "standingsLink" || linkId == "teamsLink" || linkId == "accountLink"){
          this.removeActiveClassFromLinks("aboutLi", "contactLi", "locationsLi", "chatLi", "active");
          this.removeActiveClassFromLinks("scheduleLink", "standingsLink", "teamsLink", "accountLink", "bottomNavActiveLink");
        }//when clicking on standings links remove its active class 
        else if(linkId == "standingsTeamLink" || linkId == "standingsIndividualLink"){
          document.getElementById("standingsTeamLink").classList.remove("standingsLinkTeam");
          document.getElementById("standingsIndividualLink").classList.remove("standingsLinkTeam");
        }//when clicking on indTeam page links clear the active class when switching from one link to another
        else if(linkId == "indTeamOverviewLink" || linkId == "indTeamStatsLink" || linkId == "indTeamPlayersLink"){
          document.getElementById("indTeamOverviewLink").classList.remove("individualTeamLinkActive");
          document.getElementById("indTeamStatsLink").classList.remove("individualTeamLinkActive");
          document.getElementById("indTeamPlayersLink").classList.remove("individualTeamLinkActive");
        }
        document.getElementById(linkId).classList.add(activeClass);
      },
  
      removeActiveClassFromLinks(linkId1,linkId2,linkId3, linkId4, activeClass){
        let links = [linkId1, linkId2, linkId3, linkId4];
        links.forEach(link => document.getElementById(link).classList.remove(activeClass));
      },    
  
    },
  
    updated() {
      app.getGamesByDate();
      app.scrollDown();
    },
  
    created() {
      this.getData();
      this.changeButtonAndMsgOnAuthState();
      this.getPosts();
      document.getElementById("scheduleLink").classList.add("bottomNavActiveLink");
      document.getElementById("standingsTeamLink").classList.add("standingsLinkTeam");
      document.getElementById("indTeamOverviewLink").classList.add("individualTeamLinkActive");
    },
  
    computed: {
  
    }
  
  });
  
  