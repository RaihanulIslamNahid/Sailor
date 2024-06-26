import Settings from '../utils/Settings'
import {
  CHOOSE_SETTINGS,
  CUSTOM_LINK,
  DARK_LINK,
  DEBUG,
  END_CAMERA_LINK,
  INIT_GAME,
  MODE,
  START_CAMERA_LINK,
  START_EXPLORE,
  START_GAME,
} from '../utils/constants'
import ExploreManager from './ExploreManager'
import GameManager from './GameManager'
import ModeManager from './ModeManager'
import { EventBusSingleton } from 'light-event-bus'
import SoundManager, { SOUNDS_CONST } from './SoundManager'
import { base64toBlob } from '../utils/base64ToBlobjs'
import gsap from 'gsap'

class UIManager {
  constructor() {
    this.settingsEl = document.body.querySelector('[data-settings]')
    this.settingsElBtn = document.body.querySelectorAll('[data-settings-btn]')
    this.modeEl = document.body.querySelector('[data-mode]')
    this.modeElBtns = document.body.querySelectorAll('[data-mode-btn]')
    this.gameEl = document.body.querySelector('[data-game]')
    this.gameElStart = document.body.querySelector('[data-game-start]')
    this.gameElEnd = document.body.querySelector('[data-game-end]')
    this.exploreEl = document.body.querySelector('[data-explore]')
    this.exploreElStart = document.body.querySelector('[data-explore-start]')
    this.menuEl = document.body.querySelector('[data-menu]')
    this.menuElBtns = document.body.querySelectorAll('[data-menu-btn]')
    this.aboutEl = document.body.querySelector('[data-about]')
    this.aboutElBtn = document.body.querySelector('[data-about-btn]')
    this.compassElBkg = document.body.querySelector('[data-compass-bkg]')
    this.joystickEl = document.body.querySelector('[data-joystick]')
    this.jumpBtnEl = document.body.querySelector('.jump-button')
    this.screenshotEl = document.body.querySelector('[data-screenshot]')
    this.screenshotElImg = document.body.querySelector('[data-screenshot-img]')
    this.screenshotElClose = document.body.querySelector('[data-screenshot-btn]')
    this.screenshotElShareX = document.body.querySelector('[data-screenshot-share-x]')
    this.screenshotElShareFb = document.body.querySelector('[data-screenshot-share-fb]')
    this.screenshotElDl = document.body.querySelector('[data-screenshot-download]')
    this.footerElLinks = document.body.querySelectorAll('.footer.touch-hidden a')
    this.footerSound = document.body.querySelector('[data-footer-sound]')
    this.footerSoundTouch = document.body.querySelector('[data-footer-sound-touch]')
    this.cookieEl = document.body.querySelector('[data-cookie]')
    this.cookieElBtn = document.body.querySelector('[data-cookie-button]')
    this.cookieElNoBtn = document.body.querySelector('[data-cookie-button-no]')

    const cookieConsent = window.localStorage.getItem('cookie-consent')

    if (cookieConsent) {
      this._cookieConsent()
    } else {
      this.cookieEl.classList.add('visible')
      this.cookieElBtn.addEventListener('click', this._cookieConsent)
      this.cookieElNoBtn.addEventListener('click', this._cookieNo)
    }

    // Events
    this.gameElStart.addEventListener('click', this._gameStartClick)
    this.aboutElBtn.addEventListener('click', this._closeAbout)
    this.exploreElStart.addEventListener('click', this._exploreStartClick)
    this.footerSound.addEventListener('click', this._toggleSound)
    this.footerSoundTouch.addEventListener('click', this._toggleSound)

    if (!Settings.touch) {
      this.gameElStart.addEventListener('mouseenter', this._hoverSound)
      this.aboutElBtn.addEventListener('mouseenter', this._hoverSound)
      this.exploreElStart.addEventListener('mouseenter', this._hoverSound)
      this.footerSound.addEventListener('mouseenter', this._hoverSound)
    }

    this.modeElBtns.forEach((el) => {
      el.addEventListener('click', this._modeBtnClick)
      if (!Settings.touch) el.addEventListener('mouseenter', this._hoverSound)
    })
    this.menuElBtns.forEach((el) => {
      el.addEventListener('click', this._menuBtnClick)
      if (!Settings.touch) el.addEventListener('mouseenter', this._hoverSound)
    })
    this.settingsElBtn.forEach((el) => {
      el.addEventListener('click', this._chooseQuality, { once: true })
    })
    this.footerElLinks.forEach((el) => {
      el.addEventListener('mouseenter', this._hoverSound)
    })

    this.screenshotElClose.addEventListener('click', this._closeScreenshot)
    this.screenshotElShareX.addEventListener('click', this._shareScreenshotX)
    this.screenshotElShareFb.addEventListener('click', this._shareScreenshotFb)
    this.screenshotElDl.addEventListener('click', this._dlScreenshot)
    if (!Settings.touch) {
      this.screenshotElClose.addEventListener('mouseenter', this._hoverSound)
      this.screenshotElShareX.addEventListener('mouseenter', this._hoverSound)
      this.screenshotElShareFb.addEventListener('mouseenter', this._hoverSound)
      this.screenshotElDl.addEventListener('mouseenter', this._hoverSound)
    }

    // Custom Link
    this.linkCloseBtn = document.body.querySelector('[data-link-btn]')
    this.mouthElLeft = document.body.querySelector('[data-mouth-left]')
    this.mouthElRight = document.body.querySelector('[data-mouth-right]')
    this.mouthElNumber = document.body.querySelector('[data-mouth-number]')
    this.eyeLeftElLeft = document.body.querySelector('[data-eye-left-left]')
    this.eyeLeftElRight = document.body.querySelector('[data-eye-left-right]')
    this.eyeLeftElNumber = document.body.querySelector('[data-eye-left-number]')
    this.eyeRightElLeft = document.body.querySelector('[data-eye-right-left]')
    this.eyeRightElRight = document.body.querySelector('[data-eye-right-right]')
    this.eyeRightElNumber = document.body.querySelector('[data-eye-right-number]')

    this.mouthElLeft.addEventListener('click', this._mouthLeftClick)
    this.mouthElRight.addEventListener('click', this._mouthRightClick)
    this.eyeLeftElLeft.addEventListener('click', this._eyeLeftLeftClick)
    this.eyeLeftElRight.addEventListener('click', this._eyeLeftRightClick)
    this.eyeRightElLeft.addEventListener('click', this._eyeRightLeftClick)
    this.eyeRightElRight.addEventListener('click', this._eyeRightRightClick)
    this.linkCloseBtn.addEventListener('click', this._linkCloseClick)
    if (!Settings.touch) this.linkCloseBtn.addEventListener('mouseenter', this._hoverSound)

    this._initHearts()
    this._initScores()

    if (DEBUG) {
      setTimeout(() => {
        // Settings.sceneInit = true

        this._chooseQuality({ target: this.settingsElBtn[0] })
      }, 500)

      setTimeout(() => {
        this._modeBtnClick({ target: this.menuElBtns[0], forceMode: MODE.EXPLORE })
      }, 1600)
    }
  }

  _initHearts() {
    this.elheart = document.body.querySelector('[data-hearts]')
    this.elExploreheart = document.body.querySelector('[data-explore-hearts]')

    for (let i = 0; i < 3; i++) {
      const img = new Image()
      img.src = './icons/heart.png'
      img.classList.add('hearts__icon')
      img.classList.add('visible')
      this.elheart.appendChild(img)

      const img2 = img.cloneNode()
      this.elExploreheart.appendChild(img2)
    }
  }

  _initScores() {
    this.elScores = document.body.querySelector('[data-rupees-numbers]')
    this.elExploreScores = document.body.querySelector('[data-explore-rupees-numbers]')

    for (let i = 0; i < 5; i++) {
      const div = document.createElement('div')
      div.classList.add('rupees__number')
      div.classList.add('i0')
      this.elScores.appendChild(div)

      const div2 = div.cloneNode()
      this.elExploreScores.appendChild(div2)
    }

    this.elBestScore = document.querySelector('[data-rupees-best]')
    this.gameElEndBest = document.body.querySelector('[data-game-end-best]')

    const best = window.localStorage.getItem('best')

    if (best) {
      this.elBestScore.innerHTML = best
      this.gameElEndBest.innerHTML = best
    }
  }

  updateHearts(mode) {
    let children = this.elheart.children
    if (mode === MODE.EXPLORE) {
      children = this.elExploreheart.children
    }

    for (let i = 0; i < 3; i++) {
      const el = children[i]
      el.classList.remove('visible')
    }

    if (mode === MODE.EXPLORE) {
      for (let i = 0; i < ExploreManager.life; i++) {
        const el = children[i]

        el.classList.add('visible')
      }
    } else {
      for (let i = 0; i < GameManager.life; i++) {
        const el = children[i]

        el.classList.add('visible')
      }
    }
  }

  updateScores(mode) {
    let children = this.elScores.children
    let score = GameManager.score.toString()

    if (mode === MODE.EXPLORE) {
      children = this.elExploreScores.children
      score = ExploreManager.score.toString()
    }

    for (let i = score.length - 1; i >= 0; i--) {
      const divIndex = 4 - (score.length - 1 - i)
      const div = children[divIndex]
      div.className = ''
      div.classList.add('rupees__number')
      div.classList.add(`i${score[i]}`)
    }
  }

  reset(mode) {
    this.updateHearts(mode)

    let children = this.elScores.children

    if (mode === MODE.EXPLORE) {
      // don't reset rupees
      return
      children = this.elExploreScores.children
    }

    for (let i = 0; i < children.length; i++) {
      const div = children[i]
      div.className = ''
      div.classList.add('rupees__number')
      div.classList.add(`i0`)
    }

    if (parseInt(this.elBestScore.innerHTML) < GameManager.score) {
      window.localStorage.setItem('best', GameManager.score)
      this.elBestScore.innerHTML = GameManager.score
    }
  }

  _chooseQuality = (e) => {
    const el = e.target
    const quality = el.dataset.settingsBtn
    SoundManager.initSounds()
    EventBusSingleton.publish(CHOOSE_SETTINGS, { quality })

    // this.modeEl.classList.add('visible')
    this.settingsEl.classList.remove('visible')
  }

  _hoverSound = () => {
    SoundManager.play(SOUNDS_CONST.HOVER)
  }

  // click on a mode btn
  _modeBtnClick = (e) => {
    if (!Settings.sceneInit) return
    if (this.cantChooseMode) return
    const el = e.target
    const data = e.forceMode || el.dataset.modeBtn

    ModeManager.set(data)

    this.modeEl.classList.remove('visible')
    SoundManager.play(SOUNDS_CONST.MODE_SELECT)

    if (data === MODE.GAME) {
      this.gameEl.classList.add('visible')
      EventBusSingleton.publish(INIT_GAME)
      this.joystickEl.classList.add('is-game')
      this.jumpBtnEl.classList.add('is-game')
      this.menuElBtns[1].classList.add('hidden')
      this.menuElBtns[3].classList.add('hidden')
    } else if (data === MODE.EXPLORE) {
      // TODO: show overlay for explore
      this.joystickEl.classList.remove('is-game')
      this.jumpBtnEl.classList.remove('is-game')
      this.exploreEl.classList.add('visible')
      this.menuElBtns[1].classList.remove('hidden')
      this.menuElBtns[3].classList.remove('hidden')
      EventBusSingleton.publish(START_EXPLORE)
    }

    this.menuEl.classList.add('visible')

    this.cantChooseMode = true

    gsap.delayedCall(2, () => (this.cantChooseMode = false))
  }

  _menuBtnClick = (e) => {
    const el = e.target
    const data = el.dataset.menuBtn

    if (data === 'camera') {
      SoundManager.play(SOUNDS_CONST.PICTURE)
    } else {
      SoundManager.play(SOUNDS_CONST.OPEN)
      SoundManager.lowMusic()
    }

    if (data === 'mode') {
      this.modeEl.classList.add('visible')
      this.gameEl.classList.remove('visible')
      this.gameEl.classList.remove('started')
      this.exploreEl.classList.remove('visible')
      clearTimeout(this.menuTimeout)
      this.menuTimeout = setTimeout(() => {
        if (ModeManager.state === MODE.EXPLORE) {
          ExploreManager.reset(true)
        } else if (ModeManager.state === MODE.GAME || ModeManager.state === MODE.GAME_STARTED) {
          GameManager.resetGame(true)
        }
        ModeManager.set(MODE.DEFAULT)
      }, 1000)
      this.aboutEl.classList.remove('visible')
    } else if (data === 'about') {
      this.aboutEl.classList.add('visible')
      if (ModeManager.state === MODE.GAME_STARTED) {
        GameManager.pause()
      }
    } else if (data === 'link') {
      EventBusSingleton.publish(START_CAMERA_LINK)
      this.exploreEl.classList.add('link')
    } else if (data === 'camera') {
      this.screenshotEl.classList.add('visible')
      this.snap = true
    }
  }

  _closeAbout = () => {
    SoundManager.play(SOUNDS_CONST.CLOSE)
    this.aboutEl.classList.remove('visible')
    if (ModeManager.state === MODE.GAME_STARTED) {
      GameManager.unpause()
    }
    SoundManager.upMusic()
  }

  _closeScreenshot = () => {
    SoundManager.play(SOUNDS_CONST.CLOSE)
    this.screenshotEl.classList.remove('visible')

    if (this.lastBlobUrl) {
      URL.revokeObjectURL(this.lastBlobUrl)
    }
  }

  _dlScreenshot = () => {
    SoundManager.play(SOUNDS_CONST.SMALL_CLICK)
    // If it's already an image element, use its source (src)
    const blob = base64toBlob(this.screenshotElImg.src)
    const blobUrl = URL.createObjectURL(blob)
    this.screenshotElDl.href = blobUrl

    this.lastBlobUrl = blobUrl

    // Trigger the click event on the download link to start the download
    // this.screenshotElDl.click()
  }

  _shareScreenshotX = () => {
    SoundManager.play(SOUNDS_CONST.SMALL_CLICK)
    // Encode the text you want to pre-fill in the tweet
    const textToTweet = encodeURIComponent(
      `Check my personnal Wind Waker JS screenshot from this website! ${window.location.href}`
    )

    // Create the Twitter Web Intent URL
    const twitterIntentUrl = `https://x.com/intent/tweet?text=${textToTweet}`

    // Open a new window or tab with the Twitter Web Intent
    // Open a new small pop-up window for the Twitter Web Intent
    const width = Math.min(window.innerWidth * 0.5, 700)
    const height = Math.min(window.innerHeight * 0.5, 500)
    const left = (window.innerWidth - width) / 2
    const top = (window.innerHeight - height) / 2
    const options = `width=${width},height=${height},left=${left},top=${top}`

    window.open(twitterIntentUrl, 'Twitter Share', options)
  }

  _shareScreenshotFb = () => {
    SoundManager.play(SOUNDS_CONST.SMALL_CLICK)
    // const facebookShareUrl = 'https://work.workplace.com/sharer.php?display=popup&u=' + window.location.href

    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`

    const width = Math.min(window.innerWidth * 0.5, 700)
    const height = Math.min(window.innerHeight * 0.5, 500)
    const left = (window.innerWidth - width) / 2
    const top = (window.innerHeight - height) / 2

    const options = `width=${width},height=${height},left=${left},top=${top}`

    window.open(facebookShareUrl, 'sharer', options)
  }

  _gameStartClick = () => {
    EventBusSingleton.publish(START_GAME)
    this.gameEl.classList.add('started')
    SoundManager.play(SOUNDS_CONST.CLOSE)
    SoundManager.startMusic(SOUNDS_CONST.MUSIC_SEA)
  }

  _exploreStartClick = () => {
    this.exploreEl.classList.add('started')
    SoundManager.play(SOUNDS_CONST.CLOSE)
    SoundManager.startMusic(SOUNDS_CONST.MUSIC_SEA)
  }

  // Link click
  _mouthRightClick = () => {
    SoundManager.play(SOUNDS_CONST.SMALL_CLICK)
    EventBusSingleton.publish(CUSTOM_LINK, { type: 'mouth', incr: 1, el: this.mouthElNumber })
  }

  _mouthLeftClick = () => {
    SoundManager.play(SOUNDS_CONST.SMALL_CLICK)
    EventBusSingleton.publish(CUSTOM_LINK, { type: 'mouth', incr: -1, el: this.mouthElNumber })
  }

  _eyeLeftLeftClick = () => {
    SoundManager.play(SOUNDS_CONST.SMALL_CLICK)
    EventBusSingleton.publish(CUSTOM_LINK, { type: 'eye-left', incr: 1, el: this.eyeLeftElNumber })
  }

  _eyeLeftRightClick = () => {
    SoundManager.play(SOUNDS_CONST.SMALL_CLICK)
    EventBusSingleton.publish(CUSTOM_LINK, { type: 'eye-left', incr: -1, el: this.eyeLeftElNumber })
  }

  _eyeRightLeftClick = () => {
    SoundManager.play(SOUNDS_CONST.SMALL_CLICK)
    EventBusSingleton.publish(CUSTOM_LINK, { type: 'eye-right', incr: 1, el: this.eyeRightElNumber })
  }

  _eyeRightRightClick = () => {
    SoundManager.play(SOUNDS_CONST.SMALL_CLICK)
    EventBusSingleton.publish(CUSTOM_LINK, { type: 'eye-right', incr: -1, el: this.eyeRightElNumber })
  }

  _linkCloseClick = () => {
    this.exploreEl.classList.remove('link')
    EventBusSingleton.publish(END_CAMERA_LINK)
    SoundManager.play(SOUNDS_CONST.CLOSE)
    SoundManager.upMusic()
  }

  _toggleSound = () => {
    if (SoundManager.cut === true) {
      this.footerSound.classList.add('active')
      this.footerSoundTouch.classList.add('active')
      SoundManager.cut = false
      SoundManager.fadeInAll()
    } else {
      this.footerSound.classList.remove('active')
      this.footerSoundTouch.classList.remove('active')
      SoundManager.cut = true
      SoundManager.fadeOutAll()
    }
  }

  _cookieConsent = () => {
    window.localStorage.setItem('cookie-consent', true)
    this.cookieEl.classList.remove('visible')
    window.consentGranted()
  }

  _cookieNo = () => {
    this.cookieEl.classList.remove('visible')
  }
}

export default new UIManager()
