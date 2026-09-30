// The entry stays asynchronous on purpose: initialising React here would make
// the shared modules eager and break the federation build.
void import('./bootstrap');

export {};
