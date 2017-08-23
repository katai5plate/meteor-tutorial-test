//アカウント機能を有効化しAccountsとする
import { Accounts } from 'meteor/accounts-base';
 
//アカウント画面の設定
Accounts.ui.config({
  //ログインにはユーザーネームを使うようにする
  passwordSignupFields: 'USERNAME_ONLY',
});