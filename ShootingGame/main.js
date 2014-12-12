enchant();

var enemies = [];
var player, tension;

//自機のクラス
var Player = enchant.Class.create(enchant.Sprite, {
    initialize: function(x, y){
        enchant.Sprite.call(this, 16, 16);
        this.image = game.assets['chara.png'];
        this.x = this.tx = x; this.y = this.ty = y; this.frame = 0;
        this.addEventListener('enterframe', function(){
            this.x += Math.max(Math.min((this.tx - this.x) / 2, 4), -4);
            this.y += Math.max(Math.min((this.ty - this.y) / 2, 4), -4);
            this.x = Math.min(320 - this.width, this.x);
            this.y = Math.min(240 - this.height, this.y);
            if(game.frame % 3 == 0){     //3フレームに一回、自動的に撃つ
                     var shot = tension.value * 4;
                     for(var i = 0;i <= shot;i++){
                         var s = new PlayerShoot(this.x, this.y + i * 8 - shot * 4, i * 7 - shot * 3);
                     }
            }
        });
    }
});
//敵のクラス
var Enemy = enchant.Class.create(enchant.Sprite, {
    initialize: function(x, y, omega){
        enchant.Sprite.call(this, 16, 16);
        this.image = game.assets['chara.png'];
        this.x = x;
        this.y = y;
        this.frame = 2 + (y % 3);
        this.time = 0;

          this.omega = omega * Math.PI / 180; //ラジアン角に変換
          this.direction = 0; this.moveSpeed = this.frame * 2 - 3;

          //敵の動きを定義する
        this.addEventListener('enterframe', function(){
            this.direction += this.omega;
            this.x -= this.moveSpeed * Math.cos(this.direction);
            this.y += this.moveSpeed * Math.sin(this.direction);

               //画面外に出たら消える
            if(this.y > 240 - this.height || this.x > 320 || this.x < -this.width || this.y < -this.height){
                this.remove();
            }else if(++this.time % (this.moveSpeed * 12) === 0){
                var s = new EnemyShoot(this.x, this.y);
            }
            if(player.within(this, 4)){     //プレイヤーに当たったらゲームオーバー
                     game.end(game.score, "SCORE: " + game.score) }
        });
        game.rootScene.addChild(this);
    },
    remove: function(){
        game.rootScene.removeChild(this);
        delete enemies[this.key]; delete this;
    }
});
var Explosion = enchant.Class.create(enchant.util.ExSprite, {
    initialize: function(x, y){
        enchant.util.ExSprite.call(this, 16, 16);
        this.image = game.assets['effect0.gif']
        this.x = x;
        this.y = y;
        this.blast(6);
        this.show();
    }
});
//弾のクラス
var Shoot = enchant.Class.create(enchant.Sprite, {
    initialize: function(x, y, direction, moveSpeed){
        enchant.Sprite.call(this, 16, 16);
        this.image = game.assets['chara.png'];
        this.x = x; this.y = y; this.frame = 5;
        this.direction = direction; this.moveSpeed = moveSpeed;
        this.addEventListener('enterframe', function(){ //弾は決められた方向にまっすぐ飛ぶ
            this.x += this.moveSpeed * Math.cos(this.direction);
            this.y += this.moveSpeed * Math.sin(this.direction);
            if(this.y > 240 - this.height || this.x > 320 || this.x < -this.width || this.y < -this.height){
                this.remove();
            }
        });
        game.rootScene.addChild(this);
    },
    remove: function(){ game.rootScene.removeChild(this); delete this; }
});
//プレイヤーの撃つ弾のクラス

var PlayerShoot = enchant.Class.create(Shoot, { //弾のクラスを継承
    initialize: function(x, y, deg){
        Shoot.call(this, x + 12, y, deg * Math.PI / 180, 10);
        this.frame = 1;
        this.addEventListener('enterframe', function(){
            // 自機の弾が敵機に当たったかどうかの判定
            for(var i in enemies){
                if(enemies[i].intersect(this)){
                    //当たっていたら敵を消去
                    var explosion = new Explosion(this.x, this.y); this.remove(); enemies[i].remove();
                    tension.width += 2;
                    game.score += tension.width; //スコアを加算
                }
            }
        });
    }
});

//敵機の撃つ弾のクラス
var EnemyShoot = enchant.Class.create(Shoot, { //弾のクラスを継承
    initialize: function(x, y){
        Shoot.call(this, x, y, Math.atan2(player.y - y, player.x - x) - (rand(5) - 2) / 20, 3);
        this.addEventListener('enterframe', function(){
            this.frame = 5 + (game.frame % 4);
            if(player.within(this, 21)){ tension.width += 2; }
            if(player.within(this, 4)){     //プレイヤーに弾が当たったらゲームオーバー
                     game.end(game.score, "SCORE: " + game.score);
                }
        });
    }
});

var TensionBar = enchant.Class.create(Entity, {
    initialize: function(){
        Entity.call(this);
        this.width = 1;
        this.maxLength = 316;
        this.height = 14;
        this.backgroundColor = 'rgba(0, 200, 0)';
        this.x = this.y = 2;
        this.value = 0;
        this.addEventListener('enterframe', this.onEnterFrame);
    },
    onEnterFrame: function(){
        this.width = Math.max(Math.min(--this.width, this.maxLength) , 1);
        this.opacity = (game.frame % game.fps) / game.fps;
        this.value = this.width / this.maxLength;
        if(this.value > 0.9){
            this.backgroundColor = 'rgb(255, 0, 0)';
        }else if(this.value > 0.5){
            this.backgroundColor = 'rgb(200, 200, 0)';
        }else{
            this.backgroundColor = 'rgb(0, 200, 0)';
        }
    }
});

window.onload = function() {
     //初期設定
    game = new Game(320, 320);
    game.fps = 24; game.score = 0; game.touched = false; game.preload('chara.png');
    game.onload = function() {
        tension = new TensionBar();
        game.rootScene.addChild(tension);
        //自機の操作 タッチで移動するためのtrackpadセット
        var trackpad = new Trackpad(120, 80, 320, 240);
        trackpad.addEventListener('touchstart', function(e){
            player.tx = e.trackX;
            player.ty = e.trackY;
            game.touched = true;
        });
        trackpad.addEventListener('touchend', function(e){
            player.tx = player.x;
            player.ty = player.y;
            game.touched = false;
        });
        trackpad.addEventListener('touchmove', function(e){
            player.tx = e.trackX;
            player.ty = e.trackY;
        });
        game.rootScene.addChild(trackpad);

        player = new Player(160, 152);
        game.rootScene.addChild(player); //プレイヤーを出現させる

        game.rootScene.backgroundColor = 'black';

        game.rootScene.addEventListener('enterframe', function(){
               //ゲームを進行させる
            if(rand(100) < 6 + Math.log(game.score + 1) * 2){
                    //ランダムに敵キャラを登場させる
                var y = rand(240);
                var omega = y < 120 ? 1 : -1;
                var enemy = new Enemy(320, y, omega);
                enemy.key = game.frame;
                    enemies[game.frame] = enemy;
            }
            scoreLabel.score = game.score;
        });
        scoreLabel = new ScoreLabel(2, 2);
        game.rootScene.addChild(scoreLabel);
    }
    game.start();
}
