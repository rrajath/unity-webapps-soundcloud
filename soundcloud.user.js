// -*- mode: js; js-indent-level: 4; indent-tabs-mode: nil -*-
// ==UserScript==
// @include       http://soundcloud.com/*
// @require       utils.js
// ==/UserScript==

/* Testing URL:
 * http://www.youtube.com/watch?v=v1TsCud9QhU&feature=autoplay&list=PLDA83A73D581CEFCC&lf=plpp_play_all&playnext=120
 */

 var Unity = external.getUnityObject(1);
 window.Unity = Unity;

 function isCorrectPage() {
/*    var i, ids = ['page', 'footer-container'];

    for (i = 0; i < ids.length; i++) {
        if (!document.getElementById(ids[i])) {
            return false;
        }
    }
    */
    return true;
  }

  function setLauncherCount() {
/*    var upload_notif_count = document.evaluate('//*[@id=\"js-upload-notifications-count\"]', document, null, XPathResult.ANY_UNORDERED_NODE_TYPE, null).singleNodeValue.innerHTML;
    var your_mixcloud_notif_count = document.evaluate('//*[@id=\"js-notifications-count\"]', document, null, XPathResult.ANY_UNORDERED_NODE_TYPE, null).singleNodeValue.innerHTML;

    var total_notif_count = Number(upload_notif_count) + Number(your_mixcloud_notif_count);*/
    Unity.Launcher.setCount(1);
  }

  function changeState(dryRun) {
    var playButton = document.evaluate('//div[@class=\"sc-media-image soundTitle__playButton\"]/button[@title]',
     document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.innerHTML;
    console.log("playButton " + playButton);
    var pauseButton = document.evaluate('//div[@class=\"sc-media-image soundTitle__playButton\"]/button[@title]',
      document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.innerHTML;
    console.log("pauseButton " + pauseButton);
    var paused = document.evaluate('//div[@class=\"sc-media-image soundTitle__playButton\"]/button[@title]',
     document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.innerHTML;// !== "Play";
    console.log("paused " + paused);
    
    if (!dryRun) {
      if (paused) {
        launchClickEvent(playButton);
      } else {
        launchClickEvent(pauseButton);
      }
    }

    if (!paused) {
      Unity.MediaPlayer.setPlaybackState(Unity.MediaPlayer.PlaybackState.PLAYING);
    } else {
      Unity.MediaPlayer.setPlaybackState(Unity.MediaPlayer.PlaybackState.PAUSED);
    }
  }

  function getTrackInfo() {
    var title = null;
    var artLocation = null;
    var album = null;
    var artist = null;
    try {
/*      artLocation = document.evaluate('//li[@class=\"cloudcast-now-playing\"]/@style',
        document, null, XPathResult.ANY_UNORDERED_NODE_TYPE, null).singleNodeValue.textContent;*/
        artLocation = document.evaluate('//img[@class=\"image__full g-opacity-transition\"]/@src',
          document, null, XPathResult.ANY_UNORDERED_NODE_TYPE, null).singleNodeValue.textContent;

      title = document.evaluate('//span[@class=\"soundTitle__title\"]',
        document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent;
      album = null;
      artist = document.evaluate('//a[@class=\"soundTitle__username sc-link-light\"]',
        document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent;
    } catch (x) {}

if (!artist) {
  return null;
}

return {
  title: title,
  album: album,
  artist: artist,
  artLocation: artLocation
};
}

function musicPlayerSetup() {

  Unity.MediaPlayer.init('soundcloud.com');
  Unity.MediaPlayer.setCanGoPrevious(false);

  setInterval(wrapCallback(function retry() {
    var trackInfo = getTrackInfo(), i;

    if (trackInfo) {
      Unity.MediaPlayer.setTrack(trackInfo);
    }
    changeState(true);

    }), 10000);

  Unity.MediaPlayer.onPlayPause(wrapCallback(function () {
    changeState(false);
  }));

  Unity.MediaPlayer.onNext(wrapCallback(function () {
    var node = document.evaluate('//li[@data-p-ref="up_next"]',
     document,
     null,
     XPathResult.FIRST_ORDERED_NODE_TYPE,
     null)
    .singleNodeValue;
    launchClickEvent(node);
  }));

//  setInterval(wrapCallback(setLauncherCount), 5000);
//  setLauncherCount();

  Unity.Launcher.addAction(_("Play"), playSong);
}

if (isCorrectPage()) {
  Unity.init({ name: "SoundCloud",
   domain: 'soundcloud.com',
   homepage: 'http://www.soundcloud.com',
   iconUrl: "icon://soundcloud",
   onInit: musicPlayerSetup });
}