const layout = document.querySelector('.layout-init');
const audio = document.getElementById('audio');
const songName = document.querySelector('.name');
const songImage = document.querySelector('.songImage');
const player = document.querySelector('.player');
const pause = document.querySelector('.pause');
const progress = document.querySelector('.progress');
const progressBar = document.querySelector('.progress-bar');
const timeCurrent = document.querySelector('.time-current');
const timeDuration = document.querySelector('.time-duration');
const playList = document.querySelector('.playList');
let mouseEvent = false;
let musicList = [];
let current = 0;
let isRepeat = false;
let isShuffle = false;

// 立即執行動畫效果
(() => {
    layout.classList.add('layout')
})()

axios.get('./assets/file.json').then(res => {
    musicList.push(...res.data.source);
    // 動態產生播放列表
    const playTemplate = res.data.source.map((item, index) => {
        const musicItem = `
            <li class="d-flex align-items-center p-2 cursor" id="music-${index}" onclick="selectMusic(${index})">
                <img src="${item.img}" width="40" height="40">
                <p class="pl-3 flex-grow-1">${item.name}</p>
                <i class="material-icons">
                    play_circle_outline
                </i>
            </li>
        `;
        return `${musicItem}`
    });
    playList.innerHTML = playTemplate.join('')
    // 初始化歌曲
    selectMusic(0);
})

// 選擇播放的歌曲
function selectMusic(index) {
    audio.src = musicList[index].path
    songName.textContent = musicList[index].name;
    songImage.src = musicList[index].img;
    if (index !== 0) activeMusic()
}

// 依據播放類別取得陣列索引值並播放音樂
function playMusic(status, random=0) {
    let number;
    let max = musicList.length - 1;
    if (status === 'prev') {
        number = current - 1;
        if (number < 0) number = max;
    } else if (status === 'next') {
        number = current + 1;
        if (number > max) number = 0;
    } else if (status === 'shuffle'){
        number = random;
    }
    audio.src = musicList[number].path;
    songName.textContent = musicList[number].name;
    songImage.src = musicList[number].img;
    current = number;
    activeMusic()
}

// 播放音樂
function activeMusic() {
    audio.play();
    toggleButton('play');
}

// 播放或暫停
function toggleMusic(e) {
    const medthod = audio.paused ? 'play' : 'pause';
    audio[medthod]();
    toggleButton(medthod);
}

// 切換播放按鈕 icon
function toggleButton(medthod) {
    if (medthod === 'play') {
        player.classList.add('d-none');
        pause.classList.remove('d-none');
    } else {
        player.classList.remove('d-none');
        pause.classList.add('d-none');
    }
}

// 重置
function resetMusic() {
    player.classList.remove('d-none');
    pause.classList.add('d-none');
    audio.currentTime = 0;
    progressBar.style.flexBasis = `0%`;
    // 重複播放
    if (isRepeat) activeMusic();
    // 隨機播放
    if (isShuffle) shuffleMusic();
    // 非重複與隨機
    if (!isShuffle && !isRepeat) playMusic('next');
}

// 隨機取得播放
function shuffleMusic() {
    let randomNumber = parseInt(Math.random() * musicList.length);
    playMusic('shuffle', randomNumber)
}

// 控制重複播放
function repeat(e) {
    isRepeat = !isRepeat;
    isRepeat ? e.target.classList.add('active') : e.target.classList.remove('active');
}

// 控制隨機播放
function shuffle(e) {
    isShuffle = !isShuffle
    isShuffle ? e.target.classList.add('active') : e.target.classList.remove('active');
}

// 更新播放進度條
function updateProgress(e) {
    // 目前播放位置（以秒計）
    let current = audio.currentTime;
    let mmCur = Math.floor(current / 60);
    let ssCur = Math.floor(current % 60);
    // 目前音樂長度（以秒計）
    let duration = audio.duration;
    let mmDur = Math.floor(duration / 60);
    let ssDur = Math.floor(duration % 60);
    // 改變 progress 上的長度
    let percent = (current / duration) * 100;
    progressBar.style.flexBasis = `${percent}%`;
    timeCurrent.textContent = `${mmCur < 10 ? '0' + mmCur : mmCur}:${ssCur < 10 ? '0' + ssCur : ssCur}`
    timeDuration.textContent = `${mmDur < 10 ? '0' + mmDur : mmDur}:${ssDur < 10 ? '0' + ssDur : ssDur}`
}

// 移動播放時間
function moveTime(e) {
    if (!mouseEvent) return;
    const time = (e.offsetX / progress.offsetWidth) * audio.duration;
    audio.currentTime = time;
}

// 事件
player.addEventListener('click', toggleMusic);
pause.addEventListener('click', toggleMusic);
audio.addEventListener('canplay', updateProgress);
// event:timeupdate  當前播放的位置改變時
audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('ended', resetMusic);
progress.addEventListener('mousemove', moveTime)
progress.addEventListener('mousedown', () => mouseEvent = true)
progress.addEventListener('mouseup', () => mouseEvent = false)
