const $ =document.querySelector.bind(document)
const $$ =document.querySelectorAll.bind(document)

const PLAYER_STOTAGE_KEY = 'F8_player'
const player = $('.player')
const heading =$('header h2')
const cdThumb =$('.cd-thumb')
const audio = $('#audio')
const cd =$('.cd')
const playBtn =$('.btn-toggle-play')
const progress = $('#progress')
const nextBtn =$('.btn-next')
const prevBtn =$('.btn-prev')
const randomBtn =$('.btn-random')
const repeatBtn =$('.btn-repeat')
const playList = $('.playlist')



/**
 * 1.Render songs----------OK
 * 2. Scroll top-------------OK
 * 3.Play/pause/seek-------------OK
 * 4.CD rotate------------------------OK
 * 5.Next / prev--------------------------OK
 * 6.Random-----------------------------------OK
 * 7.Next/ Repeat when ended------------------------OK
 * 8.Active song-------------------------------------------OK
 * 9.Scroll active song into view--------------------------------OK
 * 10.Play song when click
 */

const app = {
    isPlaying: false,
    currentIndex:0,
    isRandom: false,
    isended:false,
    config :JSON.parse(localStorage.getItem(PLAYER_STOTAGE_KEY)) || {},

    songs: [
        {
            name: 'Bad Performance',
            singer:'Coldzy',
            path: './music/BadPerformance.mp3',
            image: './image/coldzy.jpeg'
        },
        {
            name: 'If You Said So',
            singer:'wxrdie&coldzy',
            path:'./music/ifyousaidso.mp3',
            image:'./image/if you said so.jpg'
        },
        {
            name: 'Cần gì nói yêu',
            singer:'wxrdie',
            path:'./music/canginoiyeu.mp3',
            image:'./image/wxdie.png'
        },
        {
            name: 'Ngọn Nến',
            singer:'Coldzy',
            path:'./music/ngonnen.mp3',
            image:'./image/coldzy2.png'
        },
        {
            name: 'Blast off',
            singer:'Jmin',
            path:'./music/Blastoff.mp3',
            image:'./image/jmin.jpg'
        },
        {
            name: 'Bad Performance',
            singer:'Coldzy',
            path: './music/BadPerformance.mp3',
            image: './image/coldzy.jpeg'
        },
        {
            name: 'If You Said So',
            singer:'wxrdie&coldzy',
            path:'./music/ifyousaidso.mp3',
            image:'./image/if you said so.jpg'
        },
        {
            name: 'Cần gì nói yêu',
            singer:'wxrdie',
            path:'./music/canginoiyeu.mp3',
            image:'./image/wxdie.png'
        },
        {
            name: 'Ngọn Nến',
            singer:'Coldzy',
            path:'./music/ngonnen.mp3',
            image:'./image/coldzy2.png'
        },
        {
            name: 'Blast off',
            singer:'Jmin',
            path:'./music/Blastoff.mp3',
            image:'./image/jmin.jpg'
        }
       

        ],
    setconfig: function(key, value){
        this.config(key) = value;
        localStorage.setItem(PLAYER_STOTAGE_KEY,JSON.stringify(this.config))
    },
    render: function(){
        const htmls = this.songs.map((song,index) =>{
            return `
            <div class="song ${index === this.currentIndex ? 'active' : '' }" data-index="${index}">
                    <div class="thumb" 
                        style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `

        })
        $('.playlist').innerHTML = htmls.join('')
    },

    defineProperties: function(){
        Object.defineProperty(this, 'currentSong',{
            get: function(){
                return this.songs[this.currentIndex]
            }
        })
    },

    HandleEvent: function(){

        const _this =this
        const cdWidth =cd.offsetWidth

        // Xử lý CD quay/dừng
        const cdRotate = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ], {
            duration: 10000,
            iterations:Infinity
        })
        cdRotate.pause()
        // Xử lý phóng to / thu nhỏ đĩa cd
        document.onscroll = function(){
            const scrollTop =document.documentElement.scrollTop || window.scrollY
            const newCdWidth = cdWidth - scrollTop
            
            cd.style.width = newCdWidth>0? newCdWidth + 'px': 0
            cd.style.opacity = newCdWidth/cdWidth

        },
        // Xử lý khi click play 
        playBtn.onclick = function(){
            
            if(_this.isPlaying){               
                audio.pause()                
            }else{                
                audio.play()                
            }
        
        },
        // Khi song is paused :pause 
        audio.onpause = function(){
            _this.isPlaying =false
            player.classList.remove('playing')
            cdRotate.pause()
        }
        // Khi song is playing : play
        audio.onplay = function(){
            _this.isPlaying = true
            player.classList.add('playing')
            cdRotate.play()
        }
        // Khi tiến độ bài hát thay đổi(thanh thời gian chạy)
        audio.ontimeupdate = function(){
            if(audio.duration){
                const progressPercent = Math.floor(audio.currentTime/audio.duration *100)
                progress.value =progressPercent
            }
        }
        // Xử lý khi tua song

        progress.oninput = function(e){
           const seekTime= audio.duration*e.target.value/100
           audio.currentTime = seekTime
           
        }
        // Khi next songs
        nextBtn.onclick = function(){
            if(_this.isRandom){
                _this.playRandomSong()
            }else(_this.nextSong())
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
            
        }
        // Khi prev songs
        prevBtn.onclick = function(){
            if(_this.isRandom){
                _this.playRandomSong()
            }else(_this.prevSong())
            audio.play()
            _this.render()
            _this.scrollToActiveSong()

        }
        // Khi randomSong
        randomBtn.onclick = function(){
            _this.isRandom =!_this.isRandom 
            _this.setconfig('isRandom',_this.isRandom)
            randomBtn.classList.toggle('active',_this.isRandom)
            
        }
        // Khi repeat songs
        repeatBtn.onclick = function(){
            _this.isended =!_this.isended
            _this.setconfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active',_this.isended)

        }
        // Khi song ended
        audio.onended = function(){
            if(_this.isended){
                audio.play()
            }else{
                nextBtn.click()
            }

        }
        // Lắng nghe hành vi click chọn song
        playList.onclick= function(e){
            const songnode = e.target.closest('.song:not(.active)')
            if( songnode|| !e.target.closest('.option')){
                if(songnode){
                    _this.currentIndex=Number(songnode.dataset.index)
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()

                }
            }
        }

    },

    scrollToActiveSong: function(){
        setTimeout(function(){
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            })
                

        },500)
    },
    loadCurrentSong: function(){
    
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path

    },
    nextSong: function(){
        this.currentIndex++
        if(this.currentIndex>=this.songs.length){
            this.currentIndex =0
        }
        this.loadCurrentSong()
    },
    prevSong: function(){
        this.currentIndex--
        if(this.currentIndex<0){
            this.currentIndex = this.songs.length -1
        }
        this.loadCurrentSong()
    },
    playRandomSong: function(){
        let newIndex =this.currentIndex
        do{
            newIndex = Math.floor(Math.random()*this.songs.length)
        }
        while(newIndex === this.currentIndex)
        this.currentIndex= newIndex 
        this.loadCurrentSong()

    },



    start: function(){
        // Định nghĩa các thuộc tính cho object
        this.defineProperties()
        
        // Lắng nghe / xử lý các sự kiện (DOM events)
        this.HandleEvent()

        this.loadCurrentSong()

        // Render ra playlist
        this.render()
    }
}

app.start()


