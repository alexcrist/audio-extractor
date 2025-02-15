import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

export const extractAudio = async (audioFile, segments) => {
    segments = segments.map((segment) => {
        const { start, end, name } = segment;
        if (!start || !end || !name) {
            throw Error("invalid segment value");
        }
        return { start, end, name };
    });

    const ffmpeg = new FFmpeg();
    ffmpeg.on("log", ({ message }) => {
        console.info(message);
    });
    ffmpeg.on("error", (error) => {
        console.error(error);
    });
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";
    await ffmpeg.load({
        coreURL: await toBlobURL(
            `${baseURL}/ffmpeg-core.js`,
            "text/javascript",
        ),
        wasmURL: await toBlobURL(
            `${baseURL}/ffmpeg-core.wasm`,
            "application/wasm",
        ),
    });
    await ffmpeg.writeFile("input.mp3", await fetchFile(audioFile));
    for (const { name, start, end } of segments) {
        const outputName = `${name}.mp3`;
        await ffmpeg.exec([
            "-i",
            "input.mp3",
            "-ss",
            start.toString(),
            "-to",
            end.toString(),
            "-acodec",
            "libmp3lame",
            outputName,
        ]);
        const data = await ffmpeg.readFile(outputName);
        const blob = new Blob([data.buffer], { type: "audio/mp3" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = outputName;
        document.body.appendChild(link);
        link.click();
        link.remove();
    }

    alert("Audio files exported!");
};
