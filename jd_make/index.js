var { spawn, exec, spawnSync, execSync } = require('child_process');
var path = require("path");
var fs = require("fs");
var process = require('process');

module.exports = async (fCfg) => {

	let fWrap = await require('@jd/lazy_make/invoke_cmake')(__dirname, fCfg);

	return {
		header: [path.join(__dirname, '../include')],
		static_lib: await fWrap(['libcppcoro.a'])
	};

}
