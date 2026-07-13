import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from '../app/App';

describe('应用界面', () => {
  it('渲染核心三栏工作区和导出操作', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: '批量输入姓名' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '实时预览' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '排版设置' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /导出 Word/u })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /导出 PPT/u })).toBeInTheDocument();
  });
});
