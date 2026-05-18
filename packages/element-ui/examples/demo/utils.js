export function createHtmlRule(html, id, name) {
    return {
        type: 'html',
        native: true,
        attrs: {innerHTML: ''},
        style: {display: 'block', width: '100%'},
        children: [html],
        _fc_id: id,
        name,
        _fc_drag_tag: 'html',
        display: true,
        hidden: false,
    };
}
