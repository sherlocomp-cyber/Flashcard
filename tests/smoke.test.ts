import { describe, expect, test } from 'vitest';
import { mount } from '../src/ui/main';

describe('app shell', () => {
  test('test_app_mounts', () => {
    const root = document.createElement('div');
    root.id = 'app';
    document.body.appendChild(root);

    mount(root);

    expect(document.querySelector('#app')).not.toBeNull();
    expect(document.querySelector('#app')!.innerHTML.trim()).not.toBe('');
  });
});
