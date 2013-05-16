'use strict';
window.addEventListener('load', function setUp() {
    //article elements
    var articles = document.querySelectorAll('article');
    //diary entries
    var entries = [];
    //the main h1
    var h1 = document.querySelector('body > h1');
    //Control showing/hidding all entries
    var controller = new DiaryController(entries, h1);
    //Create the diary entry objects
    for (var i = 0; i < articles.length; i++) {
        var article = articles[i];
        var entry = new DiaryEntry(article);
        entries.push(entry);
    }
    //using eventing, link the diary entries together so
    //that opening one closes the others.
    for (var i = 0; i < entries.length; i++) {
        var target = entries[i];
        for (var j = 0; j < entries.length; j++) {
            var listener = entries[j];
            if (target !== listener) {
                target.on('show', listener.hide);
            }
        }
    }
    /*
        DiaryController Class
        Controls showing and hidding of all entries
        */
    function DiaryController(diaryEntries, elem) {
        var state = 'hidden';
        elem.addEventListener('click', toggleAll, false);
        //show/hide all entries
        function toggleAll() {
            if (!areAnyActive() && state === 'hidden') {
                showAll();
                state = 'showing';
                return;
            }
            if (state === 'showing' && !areAnyActive()) {
                showAll();
                state = 'showing';
                return;
            }
            hideAll();
            state = 'hidden';
        }
        //Check if any entries are active
        function areAnyActive() {
            for (var i = 0; i < diaryEntries.length; i++) {
                var entry = diaryEntries[i];
                if (entry.isActive) {
                    return true;
                }
            }
            return false;
        }
        //Show all entries
        function showAll() {
            for (var i = 0; i < diaryEntries.length; i++) {
                var entry = diaryEntries[i];
                entry.show(true);
            }
        }
        //hide all entries
        function hideAll() {
            for (var i = 0; i < diaryEntries.length; i++) {
                var entry = diaryEntries[i];
                entry.hide();
            }
        }
    }
    /*
        DiaryEntry class
        */
    function DiaryEntry(entry) {
        var para = entry.querySelector('p');
        var head = entry.querySelector('h2');
        var listeners = {
            'show': [],
            'hide': []
        };
        Object.defineProperty(this, 'isActive', {
            get: isActive
        });
        //public interfaces
        Object.defineProperty(this, 'show', {
            value: show
        });
        Object.defineProperty(this, 'hide', {
            value: hide
        });
        Object.defineProperty(this, 'on', {
            value: on
        });
        Object.defineProperty(this, 'toggle', {
            value: toggle
        });
        //toggle show/hide on click
        head.addEventListener('click', toggle, false);

        function on(event, listener) {
            switch (event) {
            case 'show':
                {
                    listeners.show.push(listener);
                    break;
                }
            case 'hide':
                {
                    listeners.hide.push(listener);
                    break;
                }
            }
        }
        //check if active
        function isActive() {
            return entry.classList.contains('active');
        }
        //show/hide
        function toggle() {
            (isActive()) ? hide() : show();
        }

        function hide() {
            window.removeEventListener('resize', resize, false);
            window.removeEventListener('orientationchange', resetHeight, false);
            entry.classList.remove('active');
            para.style.height = '0';
            for (var i = 0; i < listeners.hide.length; i++) {
                listeners.hide[i]();
            }
        }
        /*
            @param force force show, don't notify listeners
            */
        function show(force) {
            window.addEventListener('resize', resize, false);
            window.addEventListener('orientationchange', resetHeight, false);
            entry.classList.add('active');
            resize();
            //lets listeners know
            if (!force) {
                for (var i = 0; i < listeners.show.length; i++) {
                    listeners.show[i]();
                }
            }
        }

        function resetHeight() {
            para.style.height = '0';
            resize();
        }
        //Resize, on resize;
        //handle orientation change and resize
        function resize(e) {
            var computedStyle = window.getComputedStyle(para);
            var computedHeight = parseInt(computedStyle.height);
            var clientHeight = para.clientHeight;
            var scrollHeight = para.scrollHeight;
            //detect first open
            if (!computedHeight && !clientHeight) {
                para.style.height = scrollHeight + 'px';
                return;
            }
            //detect overflow
            if (scrollHeight > clientHeight) {
                var padding = parseInt(computedStyle.paddingTop) + parseInt(computedStyle.paddingBottom);
                para.style.height = (scrollHeight - padding) + 'px';
            }
            //TODO: detect underflow
        }
    }
}, false);
