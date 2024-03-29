import eventBus from "../EventBus.js";

class EventBusUtil {
	// Used for non-global subscriptions that will blow away the previous listener
	static soloOn(name, callback) {
		eventBus.off(name, callback);
		eventBus.on(name, callback);
	}
}

export default EventBusUtil;
