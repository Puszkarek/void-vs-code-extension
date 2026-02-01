import * as cp from 'child_process';
import * as esbuild from 'esbuild';

export const bundleFile = async (
    entryPoint: string, 
    outfile: string, 
    tsconfigPath?: string
): Promise<void> => {
    const buildOptions: esbuild.BuildOptions = {
        entryPoints: [entryPoint],
        bundle: true,
        platform: 'node',
        packages: 'external',
        outfile: outfile,
        sourcemap: 'inline',
        logLevel: 'silent'
    };

    if (tsconfigPath) {
            buildOptions.tsconfig = tsconfigPath;
    }

    await esbuild.build(buildOptions);
};

export const runFile = (filePath: string, cwd: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const child = cp.spawn('node', ['--enable-source-maps', filePath], {
            cwd: cwd
        });

        let output = '';
        child.stdout.on('data', d => output += d.toString());
        child.stderr.on('data', d => output += d.toString());

        child.on('close', () => {
            resolve(output);
        });
        
        child.on('error', (err) => {
            reject(err);
        });
    });
};
