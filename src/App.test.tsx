// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { STORAGE_KEY } from './lib/storage';
import { MemoryStorage } from './test/MemoryStorage';

describe('App local persistence', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', new MemoryStorage());
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('automatically saves user edits and restores them after remounting', async () => {
    const firstView = render(<App />);

    fireEvent.change(screen.getByLabelText('项目名称'), {
      target: { value: '缓存集成验证' },
    });
    fireEvent.change(screen.getByLabelText('正常工资'), {
      target: { value: '50' },
    });
    fireEvent.change(screen.getAllByLabelText('返工人数')[0], {
      target: { value: '12' },
    });
    fireEvent.change(screen.getByLabelText('返工天数'), {
      target: { value: '7' },
    });
    fireEvent.blur(screen.getByLabelText('返工天数'));

    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
      expect(saved.projectName).toBe('缓存集成验证');
      expect(saved.rates.normal).toBe(50);
      expect(saved.rows[0].workers).toBe(12);
      expect(saved.rows).toHaveLength(7);
    });

    firstView.unmount();
    render(<App />);

    expect(screen.getByLabelText('项目名称')).toHaveProperty(
      'value',
      '缓存集成验证',
    );
    expect(screen.getByLabelText('正常工资')).toHaveProperty('value', '50');
    expect(screen.getAllByLabelText('返工人数')[0]).toHaveProperty(
      'value',
      '12',
    );
    expect(screen.getByLabelText('返工天数')).toHaveProperty('value', '7');
    expect(screen.getAllByLabelText('日期')).toHaveLength(7);
  });

  it('requires confirmation before reducing away a filled day', () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<App />);

    fireEvent.change(screen.getAllByLabelText('返工人数')[4], {
      target: { value: '3' },
    });
    fireEvent.change(screen.getByLabelText('返工天数'), {
      target: { value: '1' },
    });
    fireEvent.blur(screen.getByLabelText('返工天数'));

    expect(confirm).toHaveBeenCalledWith(
      '减少为 1 天会删除后面已填写的数据，是否继续？',
    );
    expect(screen.getAllByLabelText('日期')).toHaveLength(5);
    expect(screen.getByLabelText('返工天数')).toHaveProperty('value', '5');

    confirm.mockReturnValue(true);
    fireEvent.change(screen.getByLabelText('返工天数'), {
      target: { value: '1' },
    });
    fireEvent.blur(screen.getByLabelText('返工天数'));

    expect(screen.getAllByLabelText('日期')).toHaveLength(1);
  });

  it('applies the day stepper to the current typed value', () => {
    render(<App />);
    const input = screen.getByLabelText('返工天数');

    fireEvent.change(input, { target: { value: '7' } });
    fireEvent.click(screen.getByLabelText('增加一天'));

    expect(input).toHaveProperty('value', '8');
    expect(screen.getAllByLabelText('日期')).toHaveLength(8);

    fireEvent.change(input, { target: { value: '4' } });
    fireEvent.click(screen.getByLabelText('减少一天'));

    expect(input).toHaveProperty('value', '3');
    expect(screen.getAllByLabelText('日期')).toHaveLength(3);
  });

  it('confirms only the final reduced day count when using the stepper', () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<App />);
    fireEvent.change(screen.getAllByLabelText('返工人数')[4], {
      target: { value: '3' },
    });
    const input = screen.getByLabelText('返工天数');
    const decreaseButton = screen.getByLabelText('减少一天');

    fireEvent.change(input, { target: { value: '2' } });
    fireEvent.click(decreaseButton);

    expect(confirm).toHaveBeenCalledTimes(1);
    expect(confirm).toHaveBeenCalledWith(
      '减少为 1 天会删除后面已填写的数据，是否继续？',
    );
    expect(screen.getAllByLabelText('日期')).toHaveLength(1);
  });

  it('does not allow negative wages, people, or hours into report state', async () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText('正常工资'), {
      target: { value: '-50' },
    });
    fireEvent.change(screen.getAllByLabelText('返工人数')[0], {
      target: { value: '-12' },
    });
    fireEvent.change(screen.getAllByLabelText('正常工时/人')[0], {
      target: { value: '-3' },
    });

    expect(screen.getByLabelText('正常工资')).toHaveProperty('value', '');
    expect(screen.getAllByLabelText('返工人数')[0]).toHaveProperty('value', '');
    expect(screen.getAllByLabelText('正常工时/人')[0]).toHaveProperty(
      'value',
      '',
    );

    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
      expect(saved.rates.normal).toBe(0);
      expect(saved.rows[0].workers).toBe(0);
      expect(saved.rows[0].normalHours).toBe(0);
    });
  });
});
