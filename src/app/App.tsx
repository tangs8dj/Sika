import { assertPeopleForOutput, selectPeopleForOutput } from '../features/export/exportPeople';
import { createScenesForPeople } from '../features/layout/layoutEngine';
import { printScenes } from '../features/print/printService';
import { useSystemFonts } from '../hooks/useSystemFonts';
import { createExportFileName } from '../utils/fileNames';
import { toErrorMessage } from '../utils/errors';
import { validatePageSettings, validateTextStyle } from '../utils/validation';
import { ExportProgressDialog } from '../components/ExportProgressDialog';
import { NameInputPanel } from '../components/NameInputPanel';
import { PreviewPanel } from '../components/PreviewPanel';
import { SettingsPanel } from '../components/SettingsPanel';
import { StatusBar } from '../components/StatusBar';
import { Toast } from '../components/Toast';
import { TopToolbar } from '../components/TopToolbar';
import { useProjectStore, type BusyTask } from '../store/useProjectStore';

function outputContext() {
  const state = useProjectStore.getState();
  const validationErrors = [
    ...validateTextStyle(state.textStyle),
    ...validatePageSettings(state.pageSettings)
  ];
  if (validationErrors.length > 0) {
    throw new Error(validationErrors[0]);
  }
  const people = selectPeopleForOutput(state.people, state.exportScope);
  assertPeopleForOutput(people);
  return {
    people,
    textStyle: state.textStyle,
    pageSettings: state.pageSettings
  };
}

async function runExclusiveTask(
  task: Exclude<BusyTask, null>,
  action: () => void | Promise<void>
) {
  const store = useProjectStore.getState();
  if (store.busyTask) return;
  store.setBusyTask(task);
  try {
    await action();
  } catch (error) {
    store.showToast({ kind: 'error', message: toErrorMessage(error) });
  } finally {
    const latest = useProjectStore.getState();
    latest.setProgress(null);
    latest.setBusyTask(null);
  }
}

export function App() {
  useSystemFonts();
  const busyTask = useProjectStore((state) => state.busyTask);
  const newProject = useProjectStore((state) => state.newProject);
  const restoreDefaultSettings = useProjectStore((state) => state.restoreDefaultSettings);
  const showToast = useProjectStore((state) => state.showToast);

  const handlePrint = () =>
    void runExclusiveTask('print', async () => {
      const context = outputContext();
      const scenes = createScenesForPeople(context.people, context.textStyle, context.pageSettings);
      await printScenes(scenes, context.pageSettings);
      useProjectStore
        .getState()
        .showToast({ kind: 'success', message: `已准备 ${scenes.length} 张席卡用于打印。` });
    });

  const handleDocx = () =>
    void runExclusiveTask('docx', async () => {
      const context = outputContext();
      const [{ createDocxBytes }, { saveBinaryFile }] = await Promise.all([
        import('../features/export/docxExporter'),
        import('../features/export/saveBinaryFile')
      ]);
      const store = useProjectStore.getState();
      store.setProgress({
        current: 0,
        total: context.people.length,
        stage: 'rendering',
        message: '正在准备 Word 页面'
      });
      const bytes = await createDocxBytes(context.people, context.textStyle, context.pageSettings, {
        onProgress: (progress) => useProjectStore.getState().setProgress(progress)
      });
      useProjectStore.getState().setProgress({
        current: context.people.length,
        total: context.people.length,
        stage: 'saving',
        message: '请选择 Word 文件保存位置'
      });
      const path = await saveBinaryFile(bytes, {
        defaultFileName: createExportFileName('docx'),
        extension: 'docx',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
      useProjectStore
        .getState()
        .showToast(
          path
            ? { kind: 'success', message: `Word 已保存：${path}` }
            : { kind: 'info', message: '已取消保存 Word 文件。' }
        );
    });

  const handlePptx = () =>
    void runExclusiveTask('pptx', async () => {
      const context = outputContext();
      const [{ createPptxBytes }, { saveBinaryFile }] = await Promise.all([
        import('../features/export/pptxExporter'),
        import('../features/export/saveBinaryFile')
      ]);
      useProjectStore.getState().setProgress({
        current: 0,
        total: context.people.length,
        stage: 'rendering',
        message: '正在准备 PowerPoint 幻灯片'
      });
      const bytes = await createPptxBytes(context.people, context.textStyle, context.pageSettings, {
        onProgress: (progress) => useProjectStore.getState().setProgress(progress)
      });
      useProjectStore.getState().setProgress({
        current: context.people.length,
        total: context.people.length,
        stage: 'saving',
        message: '请选择 PowerPoint 文件保存位置'
      });
      const path = await saveBinaryFile(bytes, {
        defaultFileName: createExportFileName('pptx'),
        extension: 'pptx',
        mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      });
      useProjectStore
        .getState()
        .showToast(
          path
            ? { kind: 'success', message: `PowerPoint 已保存：${path}` }
            : { kind: 'info', message: '已取消保存 PowerPoint 文件。' }
        );
    });

  return (
    <div className="app-shell">
      <TopToolbar
        busyTask={busyTask}
        onNew={() => {
          newProject();
          showToast({ kind: 'info', message: '已新建空白席卡项目。' });
        }}
        onPrint={handlePrint}
        onExportDocx={handleDocx}
        onExportPptx={handlePptx}
        onRestoreDefaults={() => {
          restoreDefaultSettings();
          showToast({ kind: 'success', message: '已恢复默认样式和 A4 纵向页面。' });
        }}
      />
      <div className="workspace">
        <NameInputPanel />
        <PreviewPanel />
        <SettingsPanel />
      </div>
      <StatusBar />
      <ExportProgressDialog />
      <Toast />
    </div>
  );
}
