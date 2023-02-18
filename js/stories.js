"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story. */
 

function generateStoryMarkup(story, isFavorite) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  //add the star icon for each story
  let starIcon = "";
  if (isFavorite) {
    starIcon = '<i class="fas fa-star"></i>';
  } else {
    starIcon = '<i class="far fa-star"></i>';
  }
  return $(`
      <li id="${story.storyId}">
      ${starIcon}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const isFav = isFavorite(story.storyId);
    const $story = generateStoryMarkup(story, isFav);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}
//subpart 2B
//function for when users submit the form
//this function should get the data from the form

async function submitForm(evt){
  console.debug("submitForm",evt);
  evt.preventDefault(); 
  //obtain all the information from the form
  const author = $("#create-author").val();
  const title = $("#create-title").val();
  const url = $("#create-url").val();
  //gets the username of the current user from the current user object
  const username = currentUser.username;
  const storyData = {title,url,author, username};
  //call async addStory method of the storyList object passing in the curretn user and the story data  object
  //this adds the story to the server
  const story = await storyList.addStory(currentUser, storyData);
  //generates HTML markup for the new story using the generateStory markup function
  const $story = generateStoryMarkup(story);
  //prepend story at the very beginning of all the stories when it is loaded
  $allStoriesList.prepend($story);
  //reset the form
  $submitForm.slideUp("slow");
}
$submitForm.on("submit", submitForm);

//Part 3 Favorite start for story

//retrieves the users favorite stories from local storage.
function getFavorites() {
  const favoritesJSON = localStorage.getItem("favorites");
  if (favoritesJSON) {
    return JSON.parse(favoritesJSON);
  } else { //if nothing is saved the function returns an empty array
    return [];
  }
}
//save user favorites to local storage.
function saveFavorites(favorites) {
  //takes an array of favorite stories as an argument and converts to JSON string
  //save it with the key favorites
  localStorage.setItem("favorites", JSON.stringify(favorites));
}
//checks whether a particular story with a given story id is favorited
function isFavorite(storyId) {
  //call getFavorites to retrie the users favorite stories
  const favorites = getFavorites();
  //if they have a storyId matching the argument return true
  return favorites.some(story => story.storyId === storyId);
}
//update the list of favorite stories displayed on the page
// It calls getFavorites() to retrieve the user's favorite stories, 
//then empties the container element ($favoriteStories) where the favorite stories are displayed. 
function updateFavorites() {
  const favorites = getFavorites();
  $favoriteStories.empty();
  if (favorites.length === 0) {
    $favoriteStories.append("<h5>No favorites added!</h5>");
  } else {
    for (let story of favorites) {
      const $story = generateStoryMarkup(story, true);
      $favoriteStories.append($story);
    }
  }
}

// updateFavorites();
$favoriteButton.on("click", async function (evt){
  evt.preventDefault();
  // Get the ID of the story associated with the clicked star icon
  const storyId = $(this).closest("li").attr("id");

  // Find the story object in the list of stories
  const story = storyList.stories.find(s => s.storyId === storyId);

  // Toggle the favorite status for the current user
  await currentUser.toggleStoryFavorite(story);
  
  updateFavorites();
});