const ids = ['enabled', 'front']
chrome.storage.local.get({ enabled: true, front: true }).then((s) => ids.forEach((id) => { document.getElementById(id).checked = s[id] }))
ids.forEach((id) => document.getElementById(id).addEventListener('change', (e) => chrome.storage.local.set({ [id]: e.target.checked })))
