const parseHtml = text =>
    new DOMParser().parseFromString(text, 'text/html').querySelector('html')
        .textContent;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(request);
    const { message } = request;

    chrome.storage.local.get('user', ({ user }) => {
        chrome.identity.getAuthToken(
            { interactive: message === 'sign in' },
            async token => {
                if (!token) sendResponse(false);

                const options = {
                    headers: {
                        Authorization: 'Bearer ' + token,
                        Accept: 'application/json'
                    }
                };

                if (!user) {
                    const { email } = await fetch(
                        `https://www.googleapis.com/oauth2/v1/userinfo`,
                        options
                    ).then(res => res.json());
                    user = email;
                    chrome.storage.local.set({ user: email });
                }

                if (message === 'sign in') {
                    sendResponse(true);
                } else if (message === 'sign out') {
                    chrome.storage.local.remove('user');
                    chrome.identity.removeCachedAuthToken({ token });
                    const res = await fetch(
                        `https://accounts.google.com/o/oauth2/revoke?token=${token}`
                    );
                    sendResponse(res.ok);
                } else if (message === 'list') {
                    const { messages: messageIds } = await fetch(
                        `https://gmail.googleapis.com/gmail/v1/users/me/messages`,
                        options
                    ).then(res => res.json());

                    let messages = await Promise.all(
                        messageIds.map(({ id }) =>
                            fetch(
                                `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(
                                    id
                                )}`,
                                options
                            ).then(res => res.json())
                        )
                    );

                    // Sort by descending date
                    messages = messages.sort((a, b) =>
                        a.internalDate < b.internalDate ? 1 : -1
                    );

                    // Convert to table format
                    messages = messages.map(
                        ({ id, internalDate, snippet, payload }) => ({
                            id,
                            snippet: parseHtml(snippet),
                            date: new Date(
                                parseInt(internalDate)
                            ).toLocaleDateString(),
                            sender: payload.headers.find(
                                header => header.name === 'From'
                            ).value
                        })
                    );

                    sendResponse(messages);
                }
            }
        );
    });
    return true;
});
