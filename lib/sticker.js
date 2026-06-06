import fs from "node:fs";
import Crypto from "crypto";
import ff from "fluent-ffmpeg";
import webp from "node-webpmux";
import path from "path";

const temp = ".tmp";

export async function imageToWebp(media) {
    const tmpFileIn = path.join(temp, `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.tmp`);
    const tmpFileOut = path.join(temp, `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`);
    fs.writeFileSync(tmpFileIn, media.data);
    try {
        await new Promise((resolve, reject) => {
            ff(tmpFileIn)
                .on("error", reject)
                .on("end", () => resolve(true))
                .addOutputOptions([
                    "-vcodec",
                    "libwebp",
                    "-vf",
                    "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15,pad=320:320:-1:-1:color=white@0.0,split[a][b];[a]palettegen=reserve_transparent=on:transparency_color=000000[p];[b][p]paletteuse"
                ])
                .toFormat("webp")
                .saveToFile(tmpFileOut);
        });
        await fs.promises.unlink(tmpFileIn);
        const buff = fs.readFileSync(tmpFileOut);
        await fs.promises.unlink(tmpFileOut);
        return buff;
    } catch (e) {
        if (fs.existsSync(tmpFileIn)) await fs.promises.unlink(tmpFileIn);
        if (fs.existsSync(tmpFileOut)) await fs.promises.unlink(tmpFileOut);
        throw e;
    }
}

export async function videoToWebp(media) {
    const tmpFileIn = path.join(temp, `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.tmp`);
    const tmpFileOut = path.join(temp, `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`);
    fs.writeFileSync(tmpFileIn, media.data);
    try {
        await new Promise((resolve, reject) => {
            ff(tmpFileIn)
                .on("error", reject)
                .on("end", () => resolve(true))
                .addOutputOptions([
                    "-vcodec",
                    "libwebp",
                    "-vf",
                    "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15,pad=320:320:-1:-1:color=white@0.0,split[a][b];[a]palettegen=reserve_transparent=on:transparency_color=000000[p];[b][p]paletteuse",
                    "-loop",
                    "0",
                    "-ss",
                    "00:00:00",
                    "-t",
                    "00:00:05",
                    "-preset",
                    "default",
                    "-an",
                    "-vsync",
                    "0"
                ])
                .toFormat("webp")
                .saveToFile(tmpFileOut);
        });
        await fs.promises.unlink(tmpFileIn);
        const buff = fs.readFileSync(tmpFileOut);
        await fs.promises.unlink(tmpFileOut);
        return buff;
    } catch (e) {
        if (fs.existsSync(tmpFileIn)) await fs.promises.unlink(tmpFileIn);
        if (fs.existsSync(tmpFileOut)) await fs.promises.unlink(tmpFileOut);
        throw e;
    }
}

export async function writeExif(media, metadata = {}) {
    let wMedia = /webp/.test(media.mimetype)
        ? media.data
        : /image/.test(media.mimetype)
        ? await imageToWebp(media)
        : /video/.test(media.mimetype)
        ? await videoToWebp(media)
        : null;
    if (!wMedia) return null;
    const img = new webp.Image();
    const json = {
        "sticker-pack-id": metadata.packId || `${Date.now()}`,
        "sticker-pack-name": metadata.packName || "",
        "sticker-pack-publisher": metadata.packPublish || "",
        "android-app-store-link": metadata.androidApp || "https://play.google.com/store/apps/details?id=com.mobile.legends",
        "ios-app-store-link": metadata.iOSApp || "https://apps.apple.com/app/id544007664",
        emojis: metadata.emojis || ["😋","😎","🤣","😂","😁"],
        "is-avatar-sticker": metadata.isAvatar || 0
    };
    const exifAttr = Buffer.from([0x49,0x49,0x2a,0x00,0x08,0x00,0x00,0x00,0x01,0x00,0x41,0x57,0x07,0x00,0x00,0x00,0x00,0x00,0x16,0x00,0x00,0x00]);
    const jsonBuff = Buffer.from(JSON.stringify(json),"utf-8");
    const exif = Buffer.concat([exifAttr,jsonBuff]);
    exif.writeUIntLE(jsonBuff.length,14,4);
    await img.load(wMedia);
    img.exif = exif;
    return await img.save(null);
}