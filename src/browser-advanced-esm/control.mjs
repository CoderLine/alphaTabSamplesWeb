import * as alphaTab from "https://cdn.jsdelivr.net/npm/@coderline/alphatab@alpha/dist/alphaTab.min.mjs";

const toDomElement = (() => {
	const parser = document.createElement("div");
	return (html) => {
		parser.innerHTML = html;
		return parser.firstElementChild;
	};
})();

function createTrackItem(at, track) {
	const trackTemplate = Handlebars.compile(
		document.querySelector("#at-track-template").innerHTML,
	);
	const trackItem = toDomElement(trackTemplate(track));

	// init track controls
	const muteButton = trackItem.querySelector(".at-track-mute");
	const soloButton = trackItem.querySelector(".at-track-solo");
	const volumeSlider = trackItem.querySelector(".at-track-volume");

	muteButton.onclick = (e) => {
		e.stopPropagation();
		muteButton.classList.toggle("active");
		at.changeTrackMute([track], muteButton.classList.contains("active"));
	};

	soloButton.onclick = (e) => {
		e.stopPropagation();
		soloButton.classList.toggle("active");
		at.changeTrackSolo([track], soloButton.classList.contains("active"));
	};

	volumeSlider.oninput = (e) => {
		e.preventDefault();
		// Here we need to do some math to map the 1-16 slider to the
		// volume in alphaTab. In alphaTab it is 1.0 for 100% which is
		// equal to the volume in the track information
		at.changeTrackVolume(
			[track],
			volumeSlider.value / track.playbackInfo.volume,
		);
	};

	volumeSlider.onclick = (e) => {
		e.stopPropagation();
	};

	trackItem.onclick = (e) => {
		e.stopPropagation();
		at.renderTracks([track]);
	};

	muteButton.value = track.playbackInfo.isMute;
	soloButton.value = track.playbackInfo.isSolo;
	volumeSlider.value = track.playbackInfo.volume;

	trackItem.track = track;
	return trackItem;
}

function setupControl(selector) {
	const el = document.querySelector(selector);
	const control = el.closest(".at-wrap");

	const viewPort = control.querySelector(".at-viewport");
	const at = new alphaTab.AlphaTabApi(el, {
		file: "https://www.alphatab.net/files/canon.gp",
		player: {
			enablePlayer: true,
			soundFont:
				"https://cdn.jsdelivr.net/npm/@coderline/alphatab@alpha/dist/soundfont/sonivox.sf2",
			scrollElement: viewPort,
			scrollOffsetX: -10,
		},
	});
	at.error.on((e) => {
		console.error("alphaTab error", e);
	});

	el.ondragover = (e) => {
		e.stopPropagation();
		e.preventDefault();
		e.dataTransfer.dropEffect = "link";
	};

	el.ondrop = (e) => {
		e.stopPropagation();
		e.preventDefault();
		const files = e.dataTransfer.files;
		if (files.length === 1) {
			const reader = new FileReader();
			reader.onload = (data) => {
				at.load(data.target.result, [0]);
			};
			reader.readAsArrayBuffer(files[0]);
		}
		console.log("drop", files);
	};

	const trackItems = [];
	at.renderStarted.on((isResize) => {
		if (!isResize) {
			control.classList.add("loading");
		}
		const tracks = new Map();
		for (const t of at.tracks) {
			tracks.set(t.index, t);
		}

		for (const trackItem of trackItems) {
			if (tracks.has(trackItem.track.index)) {
				trackItem.classList.add("active");
			} else {
				trackItem.classList.remove("active");
			}
		}
	});

	const playerLoadingIndicator = control.querySelector(".at-player-loading");
	at.soundFontLoad.on((args) => {
		updateProgress(playerLoadingIndicator, args.loaded / args.total);
	});
	at.soundFontLoaded.on(() => {
		playerLoadingIndicator.classList.add("d-none");
	});
	at.renderFinished.on(() => {
		control.classList.remove("loading");
	});

	at.scoreLoaded.on((score) => {
		control.querySelector(".at-song-title").innerText = score.title;
		control.querySelector(".at-song-artist").innerText = score.artist;

		// fill track selector
		const trackList = control.querySelector(".at-track-list");
		trackList.innerHTML = "";

		for (const track of score.tracks) {
			const trackItem = createTrackItem(at, track);
			trackItems.push(trackItem);
			trackList.appendChild(trackItem);
		}

		currentTempo = score.tempo;
	});

	let currentTempo = 0;
	const timePositionLabel = control.querySelector(".at-time-position");
	const timeSliderValue = control.querySelector(".at-time-slider-value");

	function formatDuration(milliseconds) {
		let seconds = milliseconds / 1000;
		const minutes = (seconds / 60) | 0;
		seconds = (seconds - minutes * 60) | 0;
		return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
	}

	let previousTime = -1;
	at.playerPositionChanged.on((args) => {
		// reduce number of UI updates to second changes.
		const currentSeconds = (args.currentTime / 1000) | 0;
		if (currentSeconds === previousTime) {
			return;
		}
		previousTime = currentSeconds;

		timePositionLabel.innerText = `${formatDuration(args.currentTime)} / ${formatDuration(args.endTime)}`;
		timeSliderValue.style.width = `${((args.currentTime / args.endTime) * 100).toFixed(2)}%`;
	});

	const playPauseButton = control.querySelector(".at-play-pause");
	at.playerReady.on(() => {
		for (const c of control.querySelectorAll(".at-player .disabled")) {
			c.classList.remove("disabled");
		}
	});

	at.playerStateChanged.on((args) => {
		const icon = playPauseButton.querySelector("i");
		if (args.state === 0) {
			icon.classList.remove("fa-pause");
			icon.classList.add("fa-play");
		} else {
			icon.classList.remove("fa-play");
			icon.classList.add("fa-pause");
		}
	});

	playPauseButton.onclick = (e) => {
		e.stopPropagation();
		if (!e.target.classList.contains("disabled")) {
			at.playPause();
		}
	};

	control.querySelector(".at-stop").onclick = (e) => {
		e.stopPropagation();
		if (!e.target.classList.contains("disabled")) {
			at.stop();
		}
	};

	control.querySelector(".at-metronome").onclick = (e) => {
		e.stopPropagation();
		const link = e.target.closest("a");
		link.classList.toggle("active");
		if (link.classList.contains("active")) {
			at.metronomeVolume = 1;
		} else {
			at.metronomeVolume = 0;
		}
	};

	control.querySelector(".at-count-in").onclick = (e) => {
		e.stopPropagation();
		const link = e.target.closest("a");
		link.classList.toggle("active");
		if (link.classList.contains("active")) {
			at.countInVolume = 1;
		} else {
			at.countInVolume = 0;
		}
	};

	for (const a of control.querySelectorAll(".at-speed-options a")) {
		a.onclick = (e) => {
			e.preventDefault();
			at.playbackSpeed = Number.parseFloat(e.target.innerText);
			control.querySelector(".at-speed-label").innerText = e.target.innerText;
		};
	}

	control.querySelector(".at-loop").onclick = (e) => {
		e.stopPropagation();
		const link = e.target.closest("a");
		link.classList.toggle("active");
		if (link.classList.contains("active")) {
			at.isLooping = true;
		} else {
			at.isLooping = false;
		}
	};

	control.querySelector(".at-print").onclick = () => {
		at.print();
	};

	control.querySelector(".at-download").onclick = () => {
		const exporter = new alphaTab.exporter.Gp7Exporter();
		const data = exporter.export(at.score, at.settings);
		const a = document.createElement("a");
		a.download = at.score.title.length > 0 ? `${at.score.title}.gp` : "song.gp";
		a.href = URL.createObjectURL(new Blob([data]));
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	};

	for (const a of control.querySelectorAll(".at-zoom-options a")) {
		a.onclick = (e) => {
			e.preventDefault();
			at.settings.display.scale = Number.parseInt(e.target.innerText) / 100.0;
			control.querySelector(".at-zoom-label").innerText = e.target.innerText;
			at.updateSettings();
			at.render();
		};
	}

	for (const a of control.querySelectorAll(".at-layout-options a")) {
		a.onclick = (e) => {
			e.preventDefault();
			const settings = at.settings;
			switch (e.target.dataset.layout) {
				case "page":
					settings.display.layoutMode = alphaTab.LayoutMode.Page;
					settings.player.scrollMode = alphaTab.ScrollMode.Continuous;
					break;
				case "horizontal-bar":
					settings.display.layoutMode = alphaTab.LayoutMode.Horizontal;
					settings.player.scrollMode = alphaTab.ScrollMode.Continuous;
					break;
				case "horizontal-screen":
					settings.display.layoutMode = alphaTab.LayoutMode.Horizontal;
					settings.player.scrollMode = alphaTab.ScrollMode.OffScreen;
					break;
			}

			at.updateSettings();
			at.render();
		};
	}

	$(control).find('[data-toggle="tooltip"]').tooltip();

	return at;
}

function updateProgress(el, value) {
	const percentValue = value * 100;
	const left = el.querySelector(".progress-left .progress-bar");
	const right = el.querySelector(".progress-right .progress-bar");
	function percentageToDegrees(percentage) {
		return (percentage / 100) * 360;
	}

	if (percentValue > 0) {
		if (percentValue <= 50) {
			right.style.transform = `rotate(${percentageToDegrees(percentValue)}deg)`;
		} else {
			right.style.transform = "rotate(180deg)";
			left.style.transform = `rotate(${percentageToDegrees(percentValue - 50)}deg)`;
		}
	}
	el.querySelector(".progress-value-number").innerText = percentValue | 0;
}

setupControl("#alphaTab");
