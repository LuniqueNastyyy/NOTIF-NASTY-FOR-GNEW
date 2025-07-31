/*!
 * Copyright © Mobius1 2021
 *
 *  ! Edit it if you want, but don't re-release this without my permission, and never claim it to be yours !
 */

/*!
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
    
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

const NotificationsContainers = {};
const audio = document.createElement("audio");
let MaxQueue = 5
let styled = false;


class NotificationContainer {
    constructor(position) {
        this.container = document.getElementById("notifications_container");
        this.el = document.createElement("div");
        this.el.classList.add("notifications-notification-container", `notification-container-${position}`);
        this.notifications = [];
        this.offset = 0;
        this.running = false;
        this.spacing = 10;
        this.queue = 0;
        this.maxQueue = MaxQueue;
        this.canAdd = true;
    }

    addNotification(notification) {
        this.queue++;
        this.el.appendChild(notification.el);

        this.notifications.unshift(notification);

        if (this.queue >= this.maxQueue) {
            this.canAdd = false;
        }
    }

    removeNotification(notification) {

        PostData("removed", {
            id: notification.id
        });

        this.el.removeChild(notification.el);

        const index = this.notifications.indexOf(notification);

        if (index > -1) {
            this.notifications.splice(index, 1);
        }

        this.queue--;

        if (this.queue == 0) {
            this.canAdd = true;
        }
    }

    add() {
        if (!this.container.contains(this.el)) {
            this.container.appendChild(this.el);
        }
    }

    remove() {
        this.container.removeChild(this.el);
    }

    empty() {
        return this.el.children.length < 1;
    }
}

class Notification {
    show(stack) {
        this.bottom = this.position.includes("bottom");

        if (this.position in NotificationsContainers) {
            this.container = NotificationsContainers[this.position];
        } else {
            this.container = new NotificationContainer(this.position);
            NotificationsContainers[this.position] = this.container;
        }

        if (!this.container.running && this.container.canAdd) {

            if (this.cfg.SoundFile && audio.paused) {
                audio.setAttribute("src", `audio/${this.cfg.SoundFile}`);
                audio.volume = this.cfg.SoundVolume;
                audio.currentTime = 0;
                audio.play();
            }

            this.container.add();

            this.container.addNotification(this);

            this.el.classList.add("active");

            if (this.bottom) {
                this.el.style.bottom = `${this.container.offset}px`;
            } else {
                this.el.style.top = `${this.container.offset}px`;
            }

            if (this.progress) {
                this.el.classList.add("progress");
                this.barEl.style.animationDuration = `${this.interval}ms`;
            }

            const r = this.el.getBoundingClientRect();

            for (const n of this.container.notifications) {
                if (n != this) {
                    if (this.bottom) {
                        n.moveUp(r.height, true);
                    } else {
                        n.moveDown(r.height, true);
                    }
                }
            }

            this.hide();
        } else {
            setTimeout(() => {
                this.show();
            }, 250);
        }
    }

    hide() {
        const r = this.el.getBoundingClientRect();

        this.timeout = setTimeout(() => {
            this.el.classList.remove("active");
            this.el.classList.add("hiding");
            this.hiding = true;

            setTimeout(() => {
                const index = this.container.notifications.indexOf(this);

                for (var i = this.container.notifications.length - 1; i > index; i--) {
                    const n = this.container.notifications[i];

                    if (this.bottom) {
                        n.moveDown(r.height);
                    } else {
                        n.moveUp(r.height);
                    }
                }

                setTimeout(() => {
                    this.container.removeNotification(this);
                }, 100);
            }, this.cfg.AnimationTime);
        }, this.interval);
    }

    stack() {
        clearTimeout(this.timeout);

        const r = this.el.getBoundingClientRect();

        this.el.classList.remove("progress");
        void this.el.offsetWidth;
        this.el.classList.add("progress");

        this.count += 1;

        if (this.cfg.ShowStackedCount) {
            this.el.classList.add("stacked");
            this.el.dataset.count = this.count;
        }

        if (!this.el.querySelector('.stack-badge')) {
            const badge = document.createElement('span');
            badge.className = 'stack-badge';
            badge.textContent = this.count;
            this.el.appendChild(badge);
        } else {
            this.el.querySelector('.stack-badge').textContent = this.count;
        }

        this.hide();
    }

    moveUp(h, run = false) {
        const offset = h + this.container.spacing;

        if (this.bottom) {
            this.offset += offset;
        } else {
            this.offset -= offset;
        }
        this.el.style.transition = `transform 250ms ease 0ms`;
        this.el.style.transform = `translate3d(0px, ${-offset}px, 0px)`;

        this.container.running = run;

        setTimeout(() => {
            if (run) {
                this.container.running = false;
            }
            this.el.style.transition = ``;
            this.el.style.transform = ``;
            if (this.bottom) {
                this.el.style.bottom = `${this.container.offset + this.offset}px`;
            } else {
                this.el.style.top = `${this.container.offset + this.offset}px`;
            }
        }, 250);
    }

    moveDown(h, run = false) {
        const offset = h + this.container.spacing;

        if (this.bottom) {
            this.offset -= offset;
        } else {
            this.offset += offset;
        }
        this.el.style.transition = `transform 250ms ease 0ms`;
        this.el.style.transform = `translate3d(0px, ${offset}px, 0px)`;

        this.container.running = run;

        setTimeout(() => {
            if (run) {
                this.container.running = false;
            }
            this.el.style.transition = ``;
            this.el.style.transform = ``;

            if (this.bottom) {
                this.el.style.bottom = `${this.container.offset + this.offset}px`;
            } else {
                this.el.style.top = `${this.container.offset + this.offset}px`;
            }
        }, 250);
    }

    parseMessage(message, count = 4) {
        const regexColor = /~([^h])~([^~]+)/g;
        const regexBold = /~([h])~([^~]+)/g;
        const regexStop = /~s~/g;
        const regexLine = /\n/g;

        message = message.replace(regexColor, "<span class='$1'>$2</span>");
        message = message.replace(regexBold, "<span class='$1'>$2</span>");
        message = message.replace(regexStop, "");
        message = message.replace(regexLine, "<br />");

        return message;
    }
}

class StandardNotification extends Notification {
    constructor(cfg, id, message, interval, position, progress = false, theme = "default") {

        super();

        this.cfg = cfg;
        this.id = id;
        this.message = message;
        this.interval = interval;
        this.position = position;
        this.message = message;
        this.progress = progress;
        this.offset = 0;
        this.theme = theme;
        this.count = 1;

        this.init();
    }

    init() {
        this.el = document.createElement("div");
        this.el.classList.add("notifications-notification");

        this.message = this.parseMessage(this.message);
        this.el.innerHTML = this.message;

        if (this.theme) {
            this.el.classList.add(this.theme);
        }

        if (this.progress) {
            this.el.classList.add("with-progress");
            this.progressEl = document.createElement("div");
            this.progressEl.classList.add("notification-progress");

            this.barEl = document.createElement("div");
            this.barEl.classList.add("notification-bar");

            this.progressEl.appendChild(this.barEl);

            this.el.appendChild(this.progressEl);
        }
    }
}

class AdvancedNotification extends Notification {
    constructor(cfg, id, message, title, subject, icon, interval, position, progress = false, theme = "default", banner) {

        super();

        this.cfg = cfg
        this.id = id;
        this.message = message;
        this.banner = banner;
        this.interval = interval;
        this.position = position;
        this.title = title;
        this.subject = subject;
        this.message = message;
        this.icon = icon;
        this.progress = progress;
        this.offset = 0;
        this.theme = theme;
        this.count = 1;

        this.init();
    }

    init() {

        this.title = this.parseMessage(this.title);
        this.subject = this.parseMessage(this.subject);
        this.message = this.parseMessage(this.message);

        this.el = document.createElement("div");
        this.el.classList.add("notifications-notification");

        this.elT = document.createElement("div");
        this.elT.classList.add("notifications-compo");

        if (this.banner) {
            this.bannerEl = document.createElement("img");
            this.bannerEl.classList.add("notification-banner");
            this.bannerEl.src = `images/${this.banner}`;
            this.el.appendChild(this.bannerEl);
        }

        if (this.theme) {
            this.el.classList.add(this.theme);
        }

        this.headerEl = document.createElement("div");
        this.headerEl.classList.add("notification-header");


        this.titleComponentEl = document.createElement("div");
        this.titleComponentEl.classList.add("notification-title-component");

        this.iconEl = document.createElement("img");
        this.iconEl.classList.add("notification-icon");
        this.iconEl.src = `icons/${this.icon}`;

        this.titleEl = document.createElement("div");
        this.titleEl.classList.add("notification-title");

        this.subjectEl = document.createElement("div");
        this.subjectEl.classList.add("notification-subject");

        this.messageEl = document.createElement("div");
        this.messageEl.classList.add("notification-message");

        this.el.appendChild(this.elT);

        this.titleEl.innerHTML = this.title;
        this.subjectEl.innerHTML = this.subject;
        this.messageEl.innerHTML = this.message;

        this.titleComponentEl.appendChild(this.iconEl);
        this.titleComponentEl.appendChild(this.titleEl);

        this.headerEl.appendChild(this.titleComponentEl);
        this.headerEl.appendChild(this.subjectEl);
        this.elT.appendChild(this.headerEl);
        this.elT.appendChild(this.messageEl);

        if (this.title.length > 10) {
            this.titleEl.style.fontSize = "14px"
        }

        if (this.subject.length > 15) {
            this.subjectEl.style.fontSize = "11.5px"
        }

        if (this.progress) {
            this.el.classList.add("with-progress");
            this.progressEl = document.createElement("div");
            this.progressEl.classList.add("notification-progress");

            this.barEl = document.createElement("div");
            this.barEl.classList.add("notification-bar");

            this.progressEl.appendChild(this.barEl);

            this.el.appendChild(this.progressEl);
        }
    }
}


const PARTICLE_COLORS = [
    'rgba(180,66,208,0.18)',
    'rgba(121,96,128,0.18)',
    'rgba(200,180,255,0.13)',
    'rgba(220,220,220,0.18)',
    'rgba(255,255,255,0.13)',
    'rgba(180,66,208,0.10)',
    'rgba(121,96,128,0.10)',
    'rgba(255,255,255,0.18)'
];

function addParticlesToNotification(notificationEl, count = 12, duration = 2000) {
    const container = document.createElement('div');
    container.className = 'notification-particles';
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'notification-particle';
        const size = Math.random() * 6 + 4;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        const color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
        particle.style.background = color;
        particle.style.left = `${Math.random() * 90 + 5}%`;
        particle.style.top = `${Math.random() * 90 + 5}%`;
        const translateY = Math.random() * 40 - 20;
        const translateX = Math.random() * 40 - 20;
        particle.animate([
            { transform: 'translate(0,0)', opacity: 0.7 },
            { transform: `translate(${translateX}px,${translateY}px)`, opacity: 0.7 }
        ], {
            duration: duration,
            easing: 'ease-in-out',
            fill: 'forwards'
        });
        setTimeout(() => particle.remove(), duration);
        container.appendChild(particle);
    }
    notificationEl.appendChild(container);
}
const _StandardNotification_init = StandardNotification.prototype.init;
StandardNotification.prototype.init = function() {
    _StandardNotification_init.call(this);
    addParticlesToNotification(this.el, 12, this.interval);
}
const _AdvancedNotification_init = AdvancedNotification.prototype.init;
AdvancedNotification.prototype.init = function() {
    _AdvancedNotification_init.call(this);
    addParticlesToNotification(this.el, 12, this.interval);
}
const _Notification_show = Notification.prototype.show;
Notification.prototype.show = function(stack) {
    _Notification_show.call(this, stack);
    this.el.classList.add('animated-in');
    setTimeout(() => {
        this.el.classList.remove('animated-in');
    }, 450);
}
const _Notification_hide = Notification.prototype.hide;
Notification.prototype.hide = function() {
    this.el.classList.add('animated-out');
    setTimeout(() => {
        this.el.classList.remove('animated-out');
        _Notification_hide.call(this);
    }, 350);
}

const onData = function(e) {
    const data = e.data;
    if (data.type) {

        if (!styled) {
            const css = `
            .notifications-notification.active {
                opacity: 0;
                animation: ${data.config.AnimationIn} ${data.config.AnimationTime}ms ease 0ms forwards;
            }
            
            .notifications-notification.hiding {
                opacity: 1;
                animation: ${data.config.AnimationOut} ${data.config.AnimationTime}ms ease 0ms forwards;
            }`;

            document.head.insertAdjacentHTML("beforeend", `<style>${css}</style>`);

            styled = true
        }

        MaxQueue = data.config.Queue;

        if (data.type == "standard") {
            if (data.duplicate && data.config.Stacking) {
                stackDuplicate(data)
            } else {
                new StandardNotification(data.config, data.id, data.message, data.timeout, data.position, data.progress, data.theme).show();
            }
        } else if (data.type == "advanced") {
            if (data.duplicate && data.config.Stacking) {
                stackDuplicate(data)
            } else {
                new AdvancedNotification(data.config, data.id, data.message, data.title, data.subject, data.icon, data.timeout, data.position, data.progress, data.theme, data.banner).show();
            }
        }
    }
};

function stackDuplicate(data) {
    for (const position in NotificationsContainers) {
        for (const notification of NotificationsContainers[position].notifications) {
            if (notification.id == data.id) {
                if (notification.hiding) {
                    if (data.type == "standard") {
                        new StandardNotification(data.config, data.id, data.message, data.timeout, data.position, data.progress, data.theme).show();
                    } else if (data.type == "advanced") {
                        new AdvancedNotification(data.config, data.id, data.message, data.title, data.subject, data.icon, data.timeout, data.position, data.progress, data.theme, data.banner).show();
                    }
                } else {
                    notification.stack();
                }

                break;
            }
        }
    }
}

function PostData(type = "", data = {}) {
    fetch(`https://${GetParentResourceName()}/nui_${type}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify(data)
    }).then(resp => resp.json()).then(resp => resp).catch(error => console.log('Notifications FETCH ERROR! ' + error.message));
}

window.onload = function(e) {
    window.addEventListener('message', onData);
};