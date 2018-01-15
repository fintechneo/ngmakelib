import { suite, test, slow, timeout } from 'mocha-typescript';

@suite class Hello {
    @test world() {
        return true;
    }
}