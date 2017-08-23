//Meteor.callを使う為にMeteorを有効化する
import { Meteor } from 'meteor/meteor';
//テンプレート機能を有効化しTempleteとする
import { Template } from 'meteor/templating';
//外壁と接続
import './task.html';

//helpersでtaskタグにデータを渡す。
Template.task.helpers({
  //isOwner関数を渡す。オーナーかどうかを判別。
  isOwner() {
    return this.owner === Meteor.userId();
  },
});

//taskテンプレのイベントの挙動を決める
Template.task.events({
  //toggle-checkedクラスがクリックされた時のイベントハンドラ関数
  'click .toggle-checked'() {
    //taskテンプレ自身のIDとtaskテンプレ自身のチェック有無の逆の値
    //を抱き合わせてtasks.removeを呼ぶ
    Meteor.call('tasks.setChecked', this._id, !this.checked);
  },
  //deleteクラスがクリックされた時のイベントハンドラ関数
  'click .delete'() {
    //taskテンプレ自身のIDを抱き合わせてtasks.removeを呼ぶ
    Meteor.call('tasks.remove', this._id);
  },
  //
  'click .toggle-private'() {
    //
    Meteor.call('tasks.setPrivate', this._id, !this.private);
  },
});