
export const LOG_WRAPPER_CODE = `
const _originalLog = console.log;
console.log = (...args) => {
    try {
        throw new Error();
    } catch (e) {
        const stackLines = e.stack.split('\\n');
        // Index 2 is the caller
        const callerLine = stackLines[2] || '';
        // format: __VOID__|caller_stack|output...
        _originalLog('__VOID__|' + callerLine + '|', ...args);
    }
};
`;

export const LOG_WRAPPER_LINES = LOG_WRAPPER_CODE.split('\n').length - 1;
