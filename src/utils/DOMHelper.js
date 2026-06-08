export const DOMHelper = {
    // 安全的動作綁定器：徹底取代 eval()
    bindAction(element, eventType, actionName, registry, context = null) {
        if (!element) return;
        if (registry[actionName]) {
            element.addEventListener(eventType, (e) => {
                registry[actionName].call(context, e);
            });
        } else {
            console.warn(`[DOMHelper] 找不到註冊的動作: ${actionName}`);
        }
    }
};