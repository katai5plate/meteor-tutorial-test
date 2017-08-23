//Meteor.callを使う為にMeteorを有効化する
import { Meteor } from 'meteor/meteor';
//テンプレート機能を有効化しTempleteとする
import { Template } from 'meteor/templating';
//状態保持＆データフィルタリング機能を有効化してReactiveDictとする
import { ReactiveDict } from 'meteor/reactive-dict';
//データベース用に作ったjsと接続しTasksとする
import { Tasks } from '../api/tasks.js';
//タスクボックスのjsと接続
import './task.js';
//外壁と接続
import './body.html';

//bodyタグで最初に呼び出される
Template.body.onCreated(
  //bodyタグのセッション状態を自動反映できるようにする
  function bodyOnCreated() {
    this.state = new ReactiveDict();
    //パブリケーションを申請する（？）
    Meteor.subscribe('tasks');
  }
);

//helpersでbodyタグにデータを渡す。渡した関数は{{}}で返り値を出力できる。
Template.body.helpers({
  //tasks関数を渡す
  tasks(){
    //テンプレート自身のインスタンスを取得
    const instance = Template.instance();
    //インスタンスに設定されたhideCompletedキーがある場合
    if (instance.state.get('hideCompleted')) {
      //DBから要素を全て出し、
      return Tasks.find(
        //checked要素がtrueの物を除き($ne=notEqual)
        { checked: { $ne: true } },
        //更新順にソートする
        { sort: { createdAt: -1 } }
      );
    }
    //DBから要素を全て出し、更新順にソートする
    return Tasks.find({}, { sort: { createdAt: -1 } });

  },
  //incompleteCount関数を渡す
  incompleteCount() {
    //DBから要素を全て出し、trueの物を除く総数を返す
    return Tasks.find({ checked: { $ne: true } }).count();
  },

});

//bodyテンプレのイベントの挙動を決める
Template.body.events({
  //new-taskクラスがsubmitされた時のイベントハンドラ関数
  'submit .new-task'(event) {
    //デフォのフォーム送信機能を禁止し勝手な更新を防ぐ
    event.preventDefault();
 
    //変数targetにフォームイベントのDOM要素を接続
    const target = event.target;
    //変数textにDOM要素のうちテキストの値を接続
    const text = target.text.value;

    //変数textを抱き合わせてtasks.insertを呼ぶ
    Meteor.call('tasks.insert', text);
  
    //変数targetから入力欄の値を削除
    target.text.value = '';
  },
  //hide-completedクラスが入力により変更された時のイベントハンドラ関数
  'change .hide-completed input'(event, instance) {
    //（テンプレート自身の）インスタンスに
    //hideCompletedキーとその値event.target.checkedを設定する
    instance.state.set('hideCompleted', event.target.checked);
  },
});