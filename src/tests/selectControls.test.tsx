import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { PageSettingsPanel } from '../components/PageSettingsPanel';
import { StyleSettingsPanel } from '../components/StyleSettingsPanel';
import { DEFAULT_TEXT_STYLE } from '../features/layout/paperPresets';
import { useProjectStore } from '../store/useProjectStore';

describe('Arco 选择框', () => {
  beforeEach(() => {
    useProjectStore.getState().restoreDefaultSettings();
    useProjectStore.getState().updateTextStyle(DEFAULT_TEXT_STYLE);
  });

  it('可修改纸张、方向和自定义纸张设置', async () => {
    const user = userEvent.setup();
    render(<PageSettingsPanel />);

    await user.click(screen.getByLabelText('纸张'));
    fireEvent.click(await screen.findByText('A3'));
    expect(useProjectStore.getState().pageSettings).toMatchObject({
      paperPreset: 'A3',
      widthMm: 420,
      heightMm: 297
    });

    await user.click(screen.getByLabelText('方向'));
    fireEvent.click(await screen.findByText('纵向'));
    expect(useProjectStore.getState().pageSettings).toMatchObject({
      orientation: 'portrait',
      widthMm: 297,
      heightMm: 420
    });

    await user.click(screen.getByLabelText('纸张'));
    fireEvent.click(await screen.findByText('自定义'));
    expect(useProjectStore.getState().pageSettings.paperPreset).toBe('CUSTOM');
    expect(screen.getByText('宽度')).toBeInTheDocument();
    expect(screen.getByText('高度')).toBeInTheDocument();
  });

  it('可修改字重和最大行数，并遵循自动缩小字号的禁用状态', async () => {
    const user = userEvent.setup();
    render(<StyleSettingsPanel />);

    await user.click(screen.getByLabelText('字重'));
    fireEvent.click(await screen.findByText('常规'));
    expect(useProjectStore.getState().textStyle.fontWeight).toBe('normal');

    await user.click(screen.getByLabelText('最多行数'));
    fireEvent.click(await screen.findByText('1 行'));
    expect(useProjectStore.getState().textStyle.maxLines).toBe(1);

    useProjectStore.getState().updateTextStyle({ autoFit: false });
    await waitFor(() => {
      expect(screen.getByLabelText('最多行数')).toHaveAttribute('aria-disabled', 'true');
    });
  });
});
