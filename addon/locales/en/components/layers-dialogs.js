import RemoveDialog from './layers-dialogs/remove';
import EditDialog from './layers-dialogs/edit';
import CopyDialog from './layers-dialogs/copy';
import AddDialog from './layers-dialogs/add';
import SettingsDialogs from './layers-dialogs/settings';
import EditModes from './layers-dialogs/edit-modes';
import EditAttributes from './layers-dialogs/attributes/edit';

export default {
  'remove': RemoveDialog,
  'edit': EditDialog,
  'copy': CopyDialog,
  'add': AddDialog,
  'settings': SettingsDialogs,
  'edit-modes': EditModes,
  'edit-attributes': EditAttributes
};
