import { useProjectStore } from '../store/useProjectStore';

export function StatusBar() {
  const people = useProjectStore((state) => state.people);
  const textStyle = useProjectStore((state) => state.textStyle);
  const pageSettings = useProjectStore((state) => state.pageSettings);
  const busyTask = useProjectStore((state) => state.busyTask);
  const enabled = people.filter((person) => person.enabled).length;
  const status =
    busyTask === 'print'
      ? '正在准备打印'
      : busyTask === 'docx'
        ? '正在生成 Word'
        : busyTask === 'pptx'
          ? '正在生成 PowerPoint'
          : '就绪';

  return (
    <footer className="status-bar">
      <span>共 {people.length} 人</span>
      <span>已勾选 {enabled} 人</span>
      <span className="truncate">字体：{textStyle.fontFamily}</span>
      <span>
        纸张：{pageSettings.paperPreset === 'CUSTOM' ? '自定义' : pageSettings.paperPreset}{' '}
        {pageSettings.orientation === 'landscape' ? '横向' : '纵向'}
      </span>
      <span className={`status-state ${busyTask ? 'busy' : ''}`}>{status}</span>
    </footer>
  );
}
