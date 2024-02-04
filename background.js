// https://developer.chrome.com/docs/extensions/get-started/tutorial/scripts-activetab
chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({
    text: "OFF",
  });
});

const extensions = 'https://developer.chrome.com/docs/extensions'
const webstore = 'https://developer.chrome.com/docs/webstore'

//https://developer.chrome.com/docs/extensions/reference/api/scripting#injected-code


// When the user clicks on the extension action
chrome.action.onClicked.addListener(async (tab) => {

  console.log('i have been clicked');

  const prevState = await chrome.action.getBadgeText({ tabId: tab.id });

  const nextState = prevState === 'ON' ? 'OFF' : 'ON';

  await chrome.action.setBadgeText({
    tabId: tab.id,
    text: nextState
  });

  if (nextState === 'ON') {
    console.log('ON');
    chrome.scripting.executeScript({
      target : {tabId : tab.id},
      files : [ "floating-frogs.js" ],
    })
    .then(() => console.log("script injected"))
    .catch(err => console.log(err));

    await chrome.scripting.insertCSS({
      files: ['midi-piano.css'],
      target: { tabId: tab.id }
    });

    await chrome.scripting.insertCSS({
      files: ['frog.css'],
      target: { tabId: tab.id }
    });

  } else {
    console.log('OFF');
    // this doesn't stop the frogs from raining
    // chrome.scripting.executeScript({
    //   target : {tabId : tab.id},
    //   files : [ "stop-raining-frogs.js" ],
    // })
    // .then(() => console.log("script injected"))
    // .catch(err => console.log(err))
  }

})
  
  // if (tab.url.startsWith(extensions) || tab.url.startsWith(webstore)) {
    // console.log('i match the intended page');
    // We retrieve the action badge to check if the extension is 'ON' or 'OFF'
    
    // Next state will always be the opposite
    

    // Set the action badge to the next state
    

    // if (nextState === 'ON') {

    //   chrome.scripting.executeScript({
    //     target : {tabId : tab.id},
    //     files : [ "sounds-of-resy.js" ],
    //   })
    //   .then(() => console.log("script injected"));
      
      
    //   // Insert the CSS file when the user turns the extension on
    //   await chrome.scripting.insertCSS({
    //     files: ['focus-mode.css'],
    //     target: { tabId: tab.id }
    //   });
    // } else if (nextState === 'OFF') {
    //   // Remove the CSS file when the user turns the extension off
    //   await chrome.scripting.removeCSS({
    //     files: ['focus-mode.css'],
    //     target: { tabId: tab.id }
    //   });
    // }
  // }
// });
