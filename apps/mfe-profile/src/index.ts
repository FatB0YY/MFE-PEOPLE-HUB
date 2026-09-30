// Asynchronous on purpose: a synchronous React init here would make the shared
// modules eager and break the federation build.
void import('./bootstrap');

export {};
