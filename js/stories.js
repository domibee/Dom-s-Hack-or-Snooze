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

function getDeleteBtnHTML(){
  return `
  <span class="trash-can">
    <i class="fas fa-trash-alt"></i>
  </span>`
}

function getHeartHTML(story, user) {
  const isFavorite = user.isFavorite(story);
  const favHeart = isFavorite ? "fas" : "far";
  return `
      <span class="heart">
        <i class="${favHeart} fa-heart"></i>
      </span>`;
}

function generateStoryMarkup(story, showDeleteBtn = false) {
  // console.debug("generateStoryMarkup", story);
 
  const hostName = story.getHostName();
  const showHeart = Boolean(currentUser);
  //add the heart icon for each story
  return $(`
      <li id="${story.storyId}">
      ${showHeart ? getHeartHTML(story, currentUser) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        ${showDeleteBtn ? getDeleteBtnHTML() : ""}
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
    const $story = generateStoryMarkup(story);
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
  //call async addStory method of the storyList object passing in the current user and the story data  object
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

// * Functionality for favorites list and starr/un-starr a story
//  */

/** Put favorites list on page. */

function putFavoritesListOnPage() {
  console.debug("putFavoritesListOnPage");
  //empty favoritedStories container to remove previous content
  $favoritedStories.empty();
  //if the user has favorites the function loops through each story
  //in the favorites array and generates HTML markup and is appended to the $favoritedStories element
  if (currentUser.favorites.length === 0) {
    $favoritedStories.append("<h5>No favorites</h5>");
  } else {
    // make list of favorited stories visible to user and append to $favoritedStories
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story);
      $favoritedStories.append($story);
    }
  }

  $favoritedStories.show();
}

/** Handle favorite/un-favorite a story */

async function toggleStoryFavorite(e) {
  console.debug("toggleStoryFavorite");

  const $tgt = $(e.target);
  const $closestLi = $tgt.closest("li");
  const storyId = $closestLi.attr("id");
  const story = storyList.stories.find(s => s.storyId === storyId);

  // see if the item is already favorited (checking by presence of heart)
  if ($tgt.hasClass("fas")) {
    // currently a favorite: remove from user's fav list and change heart
    await currentUser.removeFavorite(story);
    $tgt.closest("i").toggleClass("fas far");
  } else {
    // currently not a favorite: do the opposite
    await currentUser.addFavorite(story);
    $tgt.closest("i").toggleClass("fas far");
  }
}

$storiesLists.on("click", ".heart", toggleStoryFavorite);

//Part 4: Remove stories 
function putUserStoriesOnPage() {
  console.debug("putUserStoriesOnPage");
//empty element to clear previous content
  $ownStories.empty();
//if there are no stories created by user return no stories added by user yet
  if (currentUser.ownStories.length === 0) {
    $ownStories.append("<h5>No stories added by user</h5>");
  } else {
    // loop through all of users stories and generate HTML for them
    for (let story of currentUser.ownStories) {
      //for each story a boolean true shows the story is owned by user
      let $story = generateStoryMarkup(story, true);
      //return jQuery obj containing the HTML markup and append to the $ownStories
      $ownStories.append($story);
    }
  }
  //element is displayed using the show()method
  $ownStories.show();
}

async function deleteStory(e){
  console.debug("deleteStory");
  //find the closest ancestor li element to the element that triggered the event
  //w/ the closest method 
  const $closestLi = $(e.target).closest("li");
  //extract the id attribute of the li element and assign to storyId variable
  const storyId = $closestLi.attr("id");
//call removeStory method of a storyList obj with currentUser and storyId of the story
  await storyList.removeStory(currentUser, storyId);
//if successful, call putStoriesOnPage to update the UI with updated list of stories
  await putStoriesOnPage();
}
//event listener for click event on the trash-can icon which calls the deleteStory 
//function above
$ownStories.on("click",".trash-can", deleteStory);