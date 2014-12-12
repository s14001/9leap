/**
 * Original version by phi
 * Changed by usami_yu
 */
enchant.Trackpad = enchant.Class.create(enchant.Entity, {
        
    /**
     * 初期化
     */
    initialize: function(width, height, fieldWidth, fieldHeight) {               // changed
        enchant.Entity.call(this);
        var game = enchant.Game.instance;                                        // added
        var TRACKPAD_WIDTH  = 120;
        var TRACKPAD_HEIGHT = 80;
        var TRACKPAD_COLOR  = "rgba(200,200,200,0.5)";
        var TRACKPAD_PADDING_BOTTOM = 2;
        var GAME_FIELD_WIDTH = game.width;                                       // added
        var GAME_FIELD_HEIGHT = game.height;                                     // added

        this.width = (width > 0) ? width : TRACKPAD_WIDTH;                       // changed
        this.height= (height > 0) ? height : TRACKPAD_HEIGHT;                    // changed
        this.backgroundColor = TRACKPAD_COLOR;
        this.fieldWidth = (fieldWidth > 0) ? fieldWidth : GAME_FIELD_WIDTH;      // added
        this.fieldHeight = (fieldHeight > 0) ? fieldHeight : GAME_FIELD_HEIGHT;  // added
            
        // 位置調整
//        var game = enchant.Game.instance;
        this.x = (game.width  - this.width) / 2;
        this.y = (game.height - this.height) - TRACKPAD_PADDING_BOTTOM;
            
        // 見た目調整
        var style = this._element.style;
        style.margin = style.padding = "0px";
        style.borderRadius = "4px";
    },

    /**
     * イベント起動
     */
    dispatchEvent: function(e) {
        e.target = this;
        e.localX = e.x - this._offsetX;
        e.localY = e.y - this._offsetY;

//        var game = enchant.Game.instance;
        var rateX = e.localX / this.width;
        var rateY = e.localY / this.height;

        e.rateX = (rateX < 0) ? 0.0 : ((rateX > 1.0) ? 1.0 : rateX);
        e.rateY = (rateY < 0) ? 0.0 : ((rateY > 1.0) ? 1.0 : rateY);
        e.trackX = e.rateX * this.fieldWidth;                                    // changed
        e.trackY = e.rateY * this.fieldHeight;                                   // changed

        if (this["on" + e.type] != null) this["on" + e.type](e);
        var listeners = this._listeners[e.type];
        if (listeners != null) {
            listeners = listeners.slice();
            for (var i=0, len=listeners.length; i<len; ++i) {
                listeners[i].call(this, e);
            }
        }
    }

});
