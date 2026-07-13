import { useMemo } from 'react';
import { mmToPx } from '../../utils/units';
import type { LayoutScene } from '../layout/sceneTypes';
import { renderSceneToSvg } from '../export/svgRenderer';

interface ScenePreviewProps {
  scene: LayoutScene;
  zoom: number;
  title: string;
}

export function ScenePreview({ scene, zoom, title }: ScenePreviewProps) {
  const svg = useMemo(
    () => renderSceneToSvg(scene, { includeGuides: true, title }),
    [scene, title]
  );
  const width = mmToPx(scene.pageWidthMm) * zoom;
  const height = mmToPx(scene.pageHeightMm) * zoom;

  return (
    <div
      className="scene-preview-shell"
      style={{ width: `${width}px`, height: `${height}px` }}
      aria-label={`${title}预览`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
