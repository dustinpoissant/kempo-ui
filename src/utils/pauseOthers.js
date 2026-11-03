export default (current) => {
	for(const media of document.querySelectorAll('k-audio, k-video, audio, video')){
		if(media !== current && !media.paused) media.pause();
	}
};
