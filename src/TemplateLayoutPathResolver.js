import fs from "node:fs";
import { TemplatePath } from "@11ty/eleventy-utils";
// import debugUtil from "debug";
// const debug = debugUtil("Eleventy:TemplateLayoutPathResolver");

class TemplateLayoutPathResolver {
	constructor(path, inputDir, extensionMap, eleventyConfig) {
		if (!eleventyConfig) {
			throw new Error("Expected `eleventyConfig` in TemplateLayoutPathResolver constructor");
		}
		this.eleventyConfig = eleventyConfig;
		this.inputDir = inputDir;
		this.originalPath = path;
		this.path = path;
		this.aliases = {};
		this.extensionMap = extensionMap;
		if (!extensionMap) {
			throw new Error("Expected `extensionMap` in TemplateLayoutPathResolver constructor.");
		}

		this.init();
	}

	setAliases() {
		this.aliases = Object.assign({}, this.config.layoutAliases, this.aliases);
	}

	set inputDir(dir) {
		this._inputDir = dir;
		this.dir = this.getLayoutsDir();
	}

	get inputDir() {
		return this._inputDir;
	}

	// for testing
	set config(cfg) {
		this._config = cfg;
		this.dir = this.getLayoutsDir();
		this.init();
	}

	get config() {
		if (this.eleventyConfig) {
			return this.eleventyConfig.getConfig();
		} else {
			throw new Error("Missing this.eleventyConfig");
		}
	}

	init() {
		// we might be able to move this into the constructor?
		this.aliases = Object.assign({}, this.config.layoutAliases, this.aliases);
		// debug("Current layout aliases: %o", this.aliases);

		if (this.path in this.aliases) {
			// debug(
			//   "Substituting layout: %o maps to %o",
			//   this.path,
			//   this.aliases[this.path]
			// );
			this.path = this.aliases[this.path];
		}

		let useLayoutResolution = this.config.layoutResolution;

		this.pathAlreadyHasExtension = this.dir + "/" + this.path;

		if (this.path.split(".").length > 0 && fs.existsSync(this.pathAlreadyHasExtension)) {
			this.filename = this.path;
			this.fullPath = TemplatePath.addLeadingDotSlash(this.pathAlreadyHasExtension);
		} else if (useLayoutResolution) {
			this.filename = this.findFileName();
			this.fullPath = TemplatePath.addLeadingDotSlash(this.dir + "/" + this.filename);
		}
	}

	addLayoutAlias(from, to) {
		this.aliases[from] = to;
	}

	getFileName() {
		if (!this.filename) {
			throw new Error(
				`You’re trying to use a layout that does not exist: ${this.originalPath} (${this.filename})`,
			);
		}

		return this.filename;
	}

	getFullPath() {
		if (!this.filename) {
			throw new Error(
				`You’re trying to use a layout that does not exist: ${this.originalPath} (${this.filename})`,
			);
		}

		return this.fullPath;
	}

	findFileName() {
		if (!fs.existsSync(this.dir)) {
			throw Error(
				"TemplateLayoutPathResolver directory does not exist for " + this.path + ": " + this.dir,
			);
		}

		for (let filename of this.extensionMap.getFileList(this.path)) {
			// TODO async
			if (fs.existsSync(this.dir + "/" + filename)) {
				return filename;
			}
		}
	}

	getLayoutsDir() {
		let layoutsDir;
		if ("layouts" in this.config.dir) {
			layoutsDir = this.config.dir.layouts;
		} else if ("includes" in this.config.dir) {
			layoutsDir = this.config.dir.includes;
		} else {
			// Should this have a default?
			layoutsDir = "_includes";
		}

		return TemplatePath.join(this.inputDir, layoutsDir);
	}

	getNormalizedLayoutKey() {
		return TemplatePath.stripLeadingSubPath(this.fullPath, this.getLayoutsDir());
	}
}

export default TemplateLayoutPathResolver;
