import { type Plugin, type ResolvedConfig } from 'vite';
import fs from 'fs';
import path from 'path';

interface MonacoWorkersOptions {
	/**
	 * Source directory where Monaco workers are located
	 * @default 'node_modules/@blinkx/editor/dist/workers'
	 */
	sourceDir?: string;

	/**
	 * Subdirectory within the build output where workers should be copied
	 * @default 'assets'
	 */
	assetsSubdir?: string;

	/**
	 * File extensions to copy
	 * @default ['.js']
	 */
	extensions?: string[];
}

const blinkEditorMonacoWorkers = (options: MonacoWorkersOptions = {}): Plugin => {
	let config: ResolvedConfig;

	return {
		name: 'monaco-workers-bundle',
		enforce: 'post',
		apply: 'build',
		configResolved(resolvedConfig) {
			// Store the resolved config
			config = resolvedConfig;
		},
		closeBundle: async () => {
			console.log('Monaco workers bundled to workers directory');

			// Default options
			const {
				sourceDir = 'node_modules/@blinkx/editor/dist/workers',
				assetsSubdir = 'assets',
				extensions = ['.js']
			} = options;

			// Path they already exist in
			const existingDir = path.resolve(config.root, sourceDir);

			// Get build output directory from Vite config
			const outDir = config.build?.outDir || 'dist';

			// Target directory for workers
			const targetDir = path.resolve(config.root, outDir, assetsSubdir);

			if (!fs.existsSync(targetDir)) {
				fs.mkdirSync(targetDir, { recursive: true });
			}

			// Copy all matching files from existingDir to targetDir
			try {
				if (fs.existsSync(existingDir)) {
					const files = fs.readdirSync(existingDir);

					// Filter for files with specified extensions
					const matchingFiles = files.filter(file =>
						extensions.some(ext => file.endsWith(ext))
					);

					// Copy each matching file
					for (const file of matchingFiles) {
						fs.copyFileSync(
							path.join(existingDir, file),
							path.join(targetDir, file)
						);
						console.log(`Copied ${file} to ${assetsSubdir} directory`);
					}

					console.log(`Copied ${matchingFiles.length} files to ${outDir}/${assetsSubdir} directory`);
				} else {
					console.warn(`Source directory ${existingDir} does not exist`);
				}
			} catch (error) {
				console.error('Error copying worker files:', error);
			}

			console.log('Monaco worker files processing completed');
		}
	}
}
export default blinkEditorMonacoWorkers;
