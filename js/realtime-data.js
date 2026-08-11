import { getDatabase, ref, push, set, onValue } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js';

import { app } from './firebase.js';

const database = getDatabase(app);

export function createRealtimeItem(path, data) {
    const itemRef = push(ref(database, path));
    return set(itemRef, {
        ...data,
        createdAt: Date.now()
    });
}

export function listenRealtime(path, callback) {
    return onValue(ref(database, path), (snapshot) => {
        callback(snapshot.val() || {});
    });
}

export { database };
