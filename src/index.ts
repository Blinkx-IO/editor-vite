import type { Plugin, ResolvedConfig } from 'vite';
import fs from 'fs';
import path from 'path';

interface BlinkMonacoWorkersOptions {
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

	/**
	 * Source directory for static assets
	 * @default 'node_modules/@blinkx/editor/dist/static'
	 */
	staticSourceDir?: string;

	/**
	 * Target directory for static assets within the build output
	 * @default 'static'
	 */
	staticTargetDir?: string;
}

const blinkEditorMonacoWorkers = (options: BlinkMonacoWorkersOptions = {}): Plugin => {
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

			// We need to grab the images folder fomr dist/static/images
			// and copy the images to /static
			// NOTE:  we might need to make a new folder path to not cause conflicts with client bundles
			// Default options
			const {
				sourceDir = 'node_modules/@blinkx/editor/dist/workers',
				assetsSubdir = 'assets',
				extensions = ['.js'],
				staticSourceDir = 'node_modules/@blinkx/editor/dist/static',
				staticTargetDir = 'static'
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

			// Copy static directory
			try {
				const staticSource = path.resolve(config.root, staticSourceDir);
				const staticTarget = path.resolve(config.root, outDir, staticTargetDir);

				if (fs.existsSync(staticSource)) {
					// Create target directory if it doesn't exist
					if (!fs.existsSync(staticTarget)) {
						fs.mkdirSync(staticTarget, { recursive: true });
					}

					// Helper function to copy directory recursively
					const copyDirRecursive = (src: string, dest: string) => {
						const entries = fs.readdirSync(src, { withFileTypes: true });

						for (const entry of entries) {
							const srcPath = path.join(src, entry.name);
							const destPath = path.join(dest, entry.name);

							if (entry.isDirectory()) {
								if (!fs.existsSync(destPath)) {
									fs.mkdirSync(destPath, { recursive: true });
								}
								copyDirRecursive(srcPath, destPath);
							} else {
								fs.copyFileSync(srcPath, destPath);
								console.log(`Copied ${entry.name} to ${path.relative(config.root, destPath)}`);
							}
						}
					};

					copyDirRecursive(staticSource, staticTarget);
					console.log(`Copied static directory from ${staticSourceDir} to ${outDir}/${staticTargetDir}`);
				} else {
					console.warn(`Static source directory ${staticSource} does not exist`);
				}
			} catch (error) {
				console.error('Error copying static directory:', error);
			}

			console.log('All file processing completed');
		}
	}
}
export { blinkEditorMonacoWorkers, BlinkMonacoWorkersOptions };
