import './confirmDialog.css';

// Ouvre une fenetre de confirmation et renvoie true si l'utilisateur confirme.
// Echap et "Annuler" renvoient false. Les textes sont inseres sans HTML.
export function askConfirm({ title, message, confirmLabel = 'Confirmer', cancelLabel = 'Annuler', danger = false }) {
  return new Promise(resolve => {
    const element = (tag, className, text) => {
      const node = document.createElement(tag);
      if (className) node.className = className;
      if (text) node.textContent = text;
      return node;
    };
    const dialog = element('dialog', 'confirm-dialog');
    const heading = element('h2', '', title);
    heading.id = 'confirm-title';
    const description = element('p', '', message);
    description.id = 'confirm-message';
    dialog.setAttribute('aria-labelledby', heading.id);
    dialog.setAttribute('aria-describedby', description.id);

    const cancel = element('button', 'button outline', cancelLabel);
    const accept = element('button', `button ${danger ? 'confirm-danger' : 'primary'}`, confirmLabel);
    cancel.type = 'button';
    accept.type = 'button';
    cancel.addEventListener('click', () => dialog.close('cancel'));
    accept.addEventListener('click', () => dialog.close('accept'));
    dialog.addEventListener('close', () => {
      const accepted = dialog.returnValue === 'accept';
      dialog.remove();
      resolve(accepted);
    });

    const actions = element('div', 'confirm-actions');
    actions.append(cancel, accept);
    dialog.append(heading, description, actions);
    document.body.append(dialog);
    dialog.showModal();
    cancel.focus(); // la touche Entree ne confirme pas par accident
  });
}
