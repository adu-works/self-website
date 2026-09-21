# Mars v11 assets

## Mars regolith
Generated using built-in image_gen, one call, no retries. File mars-regolith.png. Prompt requested a 1024 square seamless tileable photorealistic top-down Mars regolith albedo texture, rust brown rocky soil, fine sand granules, embedded pebbles, diffuse neutral light without directional shadows, objects, horizon or text. Tool output is actually 1254 x 1254. Seamless edges requested but not numerically verified.

## Recommended human astronaut
Current file: `dist/astronaut.glb` (original download name astronaut-human.glb). Creator Quaternius. Source https://poly.pizza/m/3hC2i0CTuO . Direct https://static.poly.pizza/0076345b-bbea-42d5-931c-4a5ad2050b18.glb . Source page declares Public Domain (CC0). License https://creativecommons.org/publicdomain/zero/1.0/ . 24 animation clips including CharacterArmature|Walk, CharacterArmature|Idle_Neutral, CharacterArmature|Wave. Original download metadata is not shipped in this prototype.


`dist/mars-panorama.png` and `dist/earth-orbit.png` are generated prototype illustrations from the earlier Sites iteration. Retained for the approved visual baseline; not evidence of real project results. Three.js and loader utilities retain their MIT notice in THREE-LICENSE.txt.

## Homepage motion studies · 2026-09-21

`dist/media/observe.mp4`, `make.mp4`, `live.mp4` and matching JPG posters were generated locally with FFmpeg: 640×400, 24 fps, 5 seconds, H.264/yuv420p, fast-start, no audio. RGB channels use sinusoidal spatial/time functions (`geq`), with three color palettes. No third-party footage or personal photos were used. They are explicitly labelled procedural demonstration clips, not Huang Lingbo's real life recordings. HTML overlays provide OBSERVE / MAKE / LIVE labels. Replace with author-approved footage and captions before using this section as a real personal portfolio.

## v2.5.0 单件作品拆解

`project-scene.mjs` 的目录、正文、问答与来源贴图由 Canvas 绘制原创示例 UI，非真实产品截图。复用 `three.module.js`；未取用 Anime.js 引擎模型或其纹理。

## v2.6.0 Mechanical case study

`project-scene.mjs` independently constructs annuli, bevels, housings, fins, aperture blades and nested gimbals using the existing MIT-licensed Three.js. All labels/textures and `engine-cover.svg` are original diagrams. The Anime.js site was inspected as an aesthetic/interaction reference; no GLB assets, textures or site implementation were copied. The instrument is explicitly a conceptual visualization of prototype functionality.
