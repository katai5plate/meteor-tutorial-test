//Meteor.callを使う為にMeteorを有効化する
import { Meteor } from 'meteor/meteor';
//MongoDBを有効にしMongoとする
import { Mongo } from 'meteor/mongo';
//check関数を使う為にcheckを有効化する
import { check } from 'meteor/check';

//Collectionでtasksというデータベースと接続/なければ作られる
export const Tasks = new Mongo.Collection('tasks');

//このコードがサーバーで実行された時
if (Meteor.isServer) {
  //パブリッシュするタスクをフィルタリングする
  Meteor.publish('tasks',
    //非プライベートで現在のユーザーのタスクのみパブリッシュ
    function tasksPublication() {
      return Tasks.find({
        $or: [
          { private: { $ne: true } },
          { owner: this.userId },
        ],
      });
    }
  );
}

//サーバーメソッド定義
Meteor.methods({
  //tasks.insertが呼ばれた場合のイベントハンドラ関数
  'tasks.insert'(text) {
    //ここで文字列じゃない物が入ってきたらエラー
    check(text, String);
 
    //ユーザーがログインしてない場合
    if (! Meteor.userId()) {
      //エラー：無許可
      throw new Meteor.Error('not-authorized');
    }
 
    //DBにデータを挿入する
    Tasks.insert({
      //変数text
      text,
      //現在時刻
      createdAt: new Date(),
      //ログイン中のユーザーID
      owner: Meteor.userId(),
      //ログイン中のユーザー名
      username: Meteor.user().username,
    });
  },
  //tasks.removeが呼ばれた場合のイベントハンドラ関数
  'tasks.remove'(taskId) {
    //ここで文字列じゃない物が入ってきたらエラー
    check(taskId, String);
    //タスクの情報を取り出す
    const task = Tasks.findOne(taskId);
    //ログインユーザがプライベートかつオーナーではない場合エラー
    if (task.private && task.owner !== Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    //taskテンプレ自身のIDの要素を削除する
    Tasks.remove(taskId);
  },
  //tasks.setCheckedが呼ばれた場合のイベントハンドラ関数
  'tasks.setChecked'(taskId, setChecked) {
    //ここで文字列じゃない物が入ってきたらエラー
    check(taskId, String);
    //真偽型じゃなければエラー
    check(setChecked, Boolean);
    //タスクの情報を取り出す
    const task = Tasks.findOne(taskId);
    //ログインユーザがプライベートかつオーナーではない場合エラー
    if (task.private && task.owner !== Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    //DBを更新
    Tasks.update(
      //taskテンプレ自身のIDを
      taskId, 
      //設定値にする
      { $set: { checked: setChecked },
    });
  },
  //
  'tasks.setPrivate'(taskId, setToPrivate) {
    //ここで文字列じゃない物が入ってきたらエラー
    check(taskId, String);
    //真偽型じゃなければエラー
    check(setToPrivate, Boolean);
    //タスクの情報を取り出す
    const task = Tasks.findOne(taskId);
    //ログインユーザがオーナーではない場合エラー
    if (task.owner !== Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    //DBを更新
    Tasks.update(
      //taskテンプレ自身のIDを
      taskId, 
      //設定値にする
      { $set: { private: setToPrivate } },
    );
  },
});