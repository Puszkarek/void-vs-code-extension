import * as vscode from 'vscode';
import { BehaviorSubject } from 'rxjs';
import { Config } from '../interfaces/config';
import { getConfig } from './get-config';

export class ConfigService {
    private _config$ = new BehaviorSubject<Config>(getConfig());
    public config$ = this._config$.asObservable();
    private _disposable: vscode.Disposable;

    constructor() {
        this._disposable = vscode.workspace.onDidChangeConfiguration(event => {
            if (event.affectsConfiguration('void')) {
                const newConfig = getConfig();
                this._config$.next(newConfig);
            }
        });
    }

    public get currentConfig() {
        return this._config$.getValue();
    }

    public dispose() {
        this._disposable.dispose();
    }
}
