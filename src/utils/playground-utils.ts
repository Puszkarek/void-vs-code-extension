import * as cp from 'child_process';

export async function bundleFile(
    entryPoint: string, 
    outfile: string, 
    tsconfigPath?: string
): Promise<void> {
    const esbuild = require('esbuild');
    const buildOptions: any = {
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
}

export function runFile(filePath: string, cwd: string): Promise<string> {
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
}
