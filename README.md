# Frame Depth Lab

Direct a flyby for a fictional orbital probe. Scrub or play the path, set camera yaw and pitch, switch to wireframe, and export a PNG of the current frame. Playback starts only after you press Play.

Open `index.html` in a browser. The renderer projects original 3D geometry onto a canvas and sorts its faces by depth. The scene runs offline without dependencies.

The general idea of an interactive 3D space scene comes from [YildizDikme/youtube-project-threejs](https://github.com/YildizDikme/youtube-project-threejs). The probe geometry, rendering code, orbital scene, timeline, and interface were created independently.

## Local server and agent connection

Install Node 22 or newer and Git. From this repository run:

```sh
npm ci
npm start
```

Open the loopback URL printed by the command. The runtime is pinned to a specific revision of [Project Agent Bridge](https://github.com/Mert-Oezdemir/project-agent-bridge).

To connect an MCP-compatible agent, run `npm run mcp:config --silent` and add its `mcpServers` entry to your host. Run `npm run doctor` to see local project and account configuration.

Chrome or Edge is needed for agent browser controls. You can set `CHROME` in `.env`, or run `npx playwright install chromium` to install a browser.

Copy `.env.example` to `.env` before adding account settings. Keep `.env` local. Restart the runtime after changing it.
