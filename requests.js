const request = require('request-promise-native');
const path = require('path')
require('dotenv').config({path: path.resolve(__dirname, './config.env')});


let responseJson = {}
let options, body, payload, subtask_id
let requests = {
    getip: function () {
        let options = {
            url: 'https://icanhazip.com',
            method: 'GET',
            proxy: process.env.PROXY,

        }

        async function getip() {
            const response = await request(options);
            return response
        }

        return getip()


    },
    getGuest: function (ClientUUID, B3TraceId) {
        options = {
            url: 'https://api.twitter.com/1.1/guest/activate.json',
            proxy: process.env.PROXY,
            resolveWithFullResponse: true,
            method: "post",
            headers: {
                'X-Twitter-Client-DeviceID': '00000000-0000-0000-0000-000000000000',
                'Accept': 'application/json',
                'X-Twitter-Client-Version': process.env.CLIENT_VERSION,
                'Authorization': process.env.AUTHORIZATION,
                'X-Client-UUID': ClientUUID,
                'X-Twitter-Client-Language': process.env.LANGUAGE,
                'X-B3-TraceId': B3TraceId,
                'Accept-Language': process.env.LANGUAGE,
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': process.env.USER_AGENT,
                'OS-Version': process.env.OS_VERSION,
                'X-Twitter-Client-Limit-Ad-Tracking': '1',
                'X-Twitter-API-Version': '5',
                'X-Twitter-Client': process.env.TWITTER_CLIENT
            }
        }
        responseJson = {}
        /**
         * @param body.guest_token
         */
        return request(options).then(response => {
            body = JSON.parse(response.body);
            responseJson['status'] = true
            responseJson['guest_token'] = body.guest_token
            return responseJson

        }).catch(function (err) {
            console.log(err)
            responseJson['status'] = false
            return responseJson
        });
    },
    getFlow: function (ClientUUID, B3TraceId, ClientVendorID, GuestToken) {
        payload = {
            "component_versions": {
                "spacer": 1,
                "progress_indicator": 1,
                "settings_group": 1,
                "card_wrapper": 1,
                "image": 1,
                "action": 1,
                "button": 1,
                "inline_callout": 1,
                "button_item": 1,
                "precise_location": 1,
                "tweet": 1,
                "inline_feedback": 1,
                "inline_tooltip": 1,
                "user": 1,
                "list": 1,
                "destructive_action": 1,
                "static_text": 1,
                "alert_example": 1,
                "boolean": 1,
                "info_item": 1,
                "toggle_wrapper": 1
            },
            "subtask_versions": {
                "enter_date": 1,
                "sign_up": 2,
                "enter_username": 3,
                "alert_dialog": 1,
                "choice_selection": 6,
                "privacy_options": 1,
                "user_recommendations_list": 5,
                "upload_media": 1,
                "tweet_selection_urt": 1,
                "action_list": 2,
                "update_users": 1,
                "select_banner": 2,
                "js_instrumentation": 1,
                "standard": 1,
                "settings_list": 7,
                "app_locale_update": 1,
                "open_home_timeline": 1,
                "generic_urt": 3,
                "wait_spinner": 3,
                "menu_dialog": 1,
                "open_account": 2,
                "single_sign_on": 1,
                "open_external_link": 1,
                "select_avatar": 4,
                "enter_password": 6,
                "cta": 7,
                "open_link": 1,
                "user_recommendations_urt": 4,
                "show_code": 1,
                "location_permission_prompt": 2,
                "sign_up_review": 5,
                "in_app_notification": 1,
                "security_key": 3,
                "phone_verification": 5,
                "contacts_live_sync_permission_prompt": 3,
                "check_logged_in_account": 1,
                "enter_phone": 2,
                "enter_text": 5,
                "enter_email": 2,
                "web_modal": 2,
                "notifications_permission_prompt": 4,
                "end_flow": 1,
                "alert_dialog_suppress_client_events": 1,
                "email_verification": 3
            }
        }
        options = {
            url: 'https://api.twitter.com/1.1/onboarding/task.json?api_version=2&ext=mediaColor&flow_name=login',
            proxy: process.env.PROXY,
            body: JSON.stringify(payload),
            resolveWithFullResponse: true,
            method: "post",
            headers: {
                'X-Twitter-Client-DeviceID': '00000000-0000-0000-0000-000000000000',
                'Accept': 'application/json',
                'X-Twitter-Client-Version': process.env.CLIENT_VERSION,
                'X-Guest-Token': GuestToken,
                'Twitter-Display-Size': '750x1334',
                'X-Twitter-Client-VendorID': ClientVendorID,
                'Authorization': process.env.AUTHORIZATION,
                'X-Client-UUID': ClientUUID,
                'X-Twitter-Client-Language': process.env.LANGUAGE,
                'X-B3-TraceId': B3TraceId,
                'Accept-Language': process.env.LANGUAGE,
                'Content-Type': 'application/json',
                'OS-Version': process.env.OS_VERSION,
                'User-Agent': process.env.USER_AGENT,
                'System-User-Agent': process.env.SYSTEM_USER_AGENT,
                'X-Twitter-Client-Limit-Ad-Tracking': '1',
                'X-Twitter-API-Version': '5',
                'X-Twitter-Client': process.env.TWITTER_CLIENT
            }

        }
        responseJson = {}
        /**
         * @param body.flow_token
         */
        return request(options).then(response => {
            body = JSON.parse(response.body);
            responseJson['status'] = true
            responseJson["flow_token"] = body.flow_token;
            responseJson["att"] = response.headers['att'];
            return responseJson

        }).catch(function (err) {
            body = JSON.parse(err.response.body);
            responseJson['status'] = false
            responseJson['code'] = body.errors[0]?.code
            responseJson['message'] = body.errors[0]?.message
            return responseJson
        });

    },
    getLoginAttempt: function (ClientUUID, B3TraceId, ClientVendorID, GuestToken, flow_token, gsm_number, att) {
        payload = {
            "flow_token": flow_token,
            "subtask_inputs": [{
                "subtask_id": "LoginEnterUserIdentifier",
                "enter_text": {
                    "link": "next_link",
                    "component_values": [],
                    "text": gsm_number
                }
            }]
        }
        options = {
            url: 'https://api.twitter.com/1.1/onboarding/task.json?ext=highlightedLabel%2CmediaColor&include_entities=1&include_profile_interstitial_type=true&include_profile_location=true&include_user_entities=true&include_user_hashtag_entities=true&include_user_mention_entities=true&include_user_symbol_entities=true',
            proxy: process.env.PROXY,
            body: JSON.stringify(payload),
            resolveWithFullResponse: true,
            method: "post",
            headers: {
                'X-Twitter-Client-DeviceID': '00000000-0000-0000-0000-000000000000',
                'Accept': 'application/json',
                'X-Twitter-Client-Version': process.env.CLIENT_VERSION,
                'X-Guest-Token': GuestToken,
                'Twitter-Display-Size': '750x1334',
                'X-Twitter-Client-VendorID': ClientVendorID,
                'Authorization': process.env.AUTHORIZATION,
                'X-Client-UUID': ClientUUID,
                'att': att,
                'X-Twitter-Client-Language': process.env.LANGUAGE,
                'X-B3-TraceId': B3TraceId,
                'Accept-Language': process.env.LANGUAGE,
                'Content-Type': 'application/json',
                'OS-Version': process.env.OS_VERSION,
                'User-Agent': process.env.USER_AGENT,
                'System-User-Agent': process.env.SYSTEM_USER_AGENT,
                'X-Twitter-Client-Limit-Ad-Tracking': '1',
                'X-Twitter-API-Version': '5',
                'X-Twitter-Client': process.env.TWITTER_CLIENT
            }

        }
        responseJson = {}
        /**
         * @param body.flow_token
         */
        return request(options).then(response => {
            body = JSON.parse(response.body);
            subtask_id = body.subtasks[0]?.subtask_id
            responseJson["status"] = true
            responseJson["flow_token"] = body.flow_token
            responseJson["subtask_id"] = subtask_id
            return responseJson
        }).catch(function (err) {
            body = JSON.parse(err.response.body);
            responseJson['status'] = false
            responseJson['code'] = body.errors[0]?.code
            responseJson['message'] = body.errors[0]?.message
            return responseJson
        });

    },
    getPasswordAttempt: function (ClientUUID, B3TraceId, ClientVendorID, GuestToken, flow_token, password, att) {
        payload = {
            "flow_token": flow_token,
            "subtask_inputs": [{
                "subtask_id": "LoginEnterPassword",
                "enter_password": {
                    "link": "next_link",
                    "component_values": [],
                    "password": password
                }
            }]
        }
        options = {
            url: 'https://api.twitter.com/1.1/onboarding/task.json?ext=highlightedLabel%2CmediaColor&include_entities=1&include_profile_interstitial_type=true&include_profile_location=true&include_user_entities=true&include_user_hashtag_entities=true&include_user_mention_entities=true&include_user_symbol_entities=true',
            proxy: process.env.PROXY,
            body: JSON.stringify(payload),
            resolveWithFullResponse: true,
            method: "post",
            headers: {
                'X-Twitter-Client-DeviceID': '00000000-0000-0000-0000-000000000000',
                'Accept': 'application/json',
                'X-Twitter-Client-Version': process.env.CLIENT_VERSION,
                'X-Guest-Token': GuestToken,
                'Twitter-Display-Size': '750x1334',
                'X-Twitter-Client-VendorID': ClientVendorID,
                'Authorization': process.env.AUTHORIZATION,
                'X-Client-UUID': ClientUUID,
                'att': att,
                'X-Twitter-Client-Language': process.env.LANGUAGE,
                'X-B3-TraceId': B3TraceId,
                'Accept-Language': process.env.LANGUAGE,
                'Content-Type': 'application/json',
                'User-Agent': process.env.USER_AGENT,
                'OS-Version': process.env.OS_VERSION,
                'X-Twitter-Client-Limit-Ad-Tracking': '1',
                'X-Twitter-API-Version': '5',
                'X-Twitter-Client': process.env.TWITTER_CLIENT
            }

        }
        responseJson = {}
        /**
         * @param body.flow_token
         * @param body.subtasks
         */
        return request(options).then(response => {
            body = JSON.parse(response.body);
            responseJson['status'] = true
            responseJson['flow_token'] = body.flow_token
            responseJson['subtask_id'] = body.subtasks[0]?.subtask_id
            responseJson['user_id'] = body.subtasks[0]?.check_logged_in_account?.user_id
            return responseJson
        }).catch(function (err) {
            body = JSON.parse(err.response.body);
            responseJson['status'] = false
            responseJson['code'] = body.errors[0]?.code
            responseJson['message'] = body.errors[0]?.message
            return responseJson
        });
    },
    getScreenName: function (GuestToken, user_id) {
        options = {
            url: `https://twitter.com/i/api/graphql/h8lgEqxcqoXc7XAvK6lUeA/UserByRestId?variables=%7B%22userId%22%3A%22${user_id}%22%2C%22withSafetyModeUserFields%22%3Atrue%2C%22withSuperFollowsUserFields%22%3Atrue%7D&features=%7B%22verified_phone_label_enabled%22%3Afalse%2C%22responsive_web_graphql_timeline_navigation_enabled%22%3Afalse%7D`,
            proxy: process.env.PROXY,
            resolveWithFullResponse: true,
            method: "GET",
            headers: {
                'Accept': 'application/json',
                'X-Twitter-Client-Version': process.env.CLIENT_VERSION,
                'X-Guest-Token': GuestToken,
                'Twitter-Display-Size': '750x1334',
                'Authorization': process.env.AUTHORIZATION,
                'User-Agent': process.env.USER_AGENT,
                'X-Twitter-Client-Limit-Ad-Tracking': '1',
                'X-Twitter-API-Version': '5',
                'X-Twitter-Client': process.env.TWITTER_CLIENT
            }

        }
        responseJson = {}
        /**
         * @param body.data.user.result.legacy.screen_name
         */
        return request(options).then(response => {
            body = JSON.parse(response.body);
            if (body.data.user.result?.reason === "Suspended") {
                return {status: false, message: body.data.user.result?.reason}
            }
            responseJson['screen_name'] = body.data.user.result.legacy.screen_name
            responseJson['status'] = true
            return responseJson
        }).catch(function (err) {
            body = JSON.parse(err.response.body);
            responseJson['status'] = false
            responseJson['code'] = body.errors[0]?.code
            responseJson['message'] = body.errors[0]?.message
            return responseJson
        });

    },
    accountDuplication: function (ClientUUID, B3TraceId, ClientVendorID, GuestToken, flow_token, att) {
        payload = {
            "flow_token": flow_token,
            "subtask_inputs": [{
                "subtask_id": "AccountDuplicationCheck",
                "check_logged_in_account": {
                    "link": "AccountDuplicationCheck_false",
                    "component_values": []
                }
            }]
        }
        options = {
            url: 'https://api.twitter.com/1.1/onboarding/task.json?ext=highlightedLabel%2CmediaColor&include_entities=1&include_profile_interstitial_type=true&include_profile_location=true&include_user_entities=true&include_user_hashtag_entities=true&include_user_mention_entities=true&include_user_symbol_entities=true',
            proxy: process.env.PROXY,
            body: JSON.stringify(payload),
            resolveWithFullResponse: true,
            method: "post",
            headers: {
                'X-Twitter-Client-DeviceID': '00000000-0000-0000-0000-000000000000',
                'Accept': 'application/json',
                'X-Twitter-Client-Version': process.env.CLIENT_VERSION,
                'X-Guest-Token': GuestToken,
                'Twitter-Display-Size': '750x1334',
                'X-Twitter-Client-VendorID': ClientVendorID,
                'Authorization': process.env.AUTHORIZATION,
                'X-Client-UUID': ClientUUID,
                'att': att,
                'X-Twitter-Client-Language': process.env.LANGUAGE,
                'X-B3-TraceId': B3TraceId,
                'Accept-Language': process.env.LANGUAGE,
                'Content-Type': 'application/json',
                'User-Agent': process.env.USER_AGENT,
                'System-User-Agent': process.env.SYSTEM_USER_AGENT,
                'OS-Version': process.env.OS_VERSION,
                'X-Twitter-Client-Limit-Ad-Tracking': '1',
                'X-Twitter-API-Version': '5',
                'X-Twitter-Client': process.env.TWITTER_CLIENT
            }

        }
        responseJson = {}
        /**
         * @param body.flow_token
         * @param body.subtasks
         */
        return request(options).then(response => {
            body = JSON.parse(response.body);
            subtask_id = body.subtasks[0]?.subtask_id
            if (subtask_id === "LoginAcid") {
                responseJson['status'] = true
                responseJson['flow_token'] = body.flow_token
                responseJson['subtask_id'] = subtask_id
                return responseJson
            } else {
                responseJson['user_id'] = body.subtasks[0]?.open_account?.user.id
                responseJson['screen_name'] = body.subtasks[0]?.open_account?.user.screen_name
                responseJson['phone_number'] = ''
                responseJson['password'] = ''
                responseJson['flow_token'] = body.flow_token
                responseJson['oauth_token'] = body.subtasks[0]?.open_account?.oauth_token
                responseJson['oauth_token_secret'] = body.subtasks[0]?.open_account?.oauth_token_secret
                responseJson['known_device_token'] = body.subtasks[0]?.open_account?.known_device_token
                responseJson['status'] = true
                return responseJson
            }
        }).catch(function (err) {
            body = JSON.parse(err.response.body);
            responseJson['status'] = false
            responseJson['code'] = body.errors[0]?.code
            responseJson['message'] = body.errors[0]?.message
            return responseJson
        });

    },
    getGuessScreenName: function (ClientUUID, B3TraceId, ClientVendorID, GuestToken, flow_token, screen_name, att) {
        payload = {
            "flow_token": flow_token,
            "subtask_inputs": [{
                "subtask_id": "LoginAcid",
                "enter_text": {
                    "link": "next_link",
                    "component_values": [],
                    "text": screen_name
                }
            }]
        }
        options = {
            url: 'https://api.twitter.com/1.1/onboarding/task.json?ext=highlightedLabel%2CmediaColor&include_entities=1&include_profile_interstitial_type=true&include_profile_location=true&include_user_entities=true&include_user_hashtag_entities=true&include_user_mention_entities=true&include_user_symbol_entities=true',
            proxy: process.env.PROXY,
            body: JSON.stringify(payload),
            resolveWithFullResponse: true,
            method: "post",
            headers: {
                'X-Twitter-Client-DeviceID': '00000000-0000-0000-0000-000000000000',
                'Accept': 'application/json',
                'X-Twitter-Client-Version': process.env.CLIENT_VERSION,
                'X-Guest-Token': GuestToken,
                'Twitter-Display-Size': '750x1334',
                'X-Twitter-Client-VendorID': ClientVendorID,
                'Authorization': process.env.AUTHORIZATION,
                'X-Client-UUID': ClientUUID,
                'att': att,
                'X-Twitter-Client-Language': process.env.LANGUAGE,
                'X-B3-TraceId': B3TraceId,
                'Accept-Language': process.env.LANGUAGE,
                'Content-Type': 'application/json',
                'User-Agent': process.env.USER_AGENT,
                'System-User-Agent': process.env.SYSTEM_USER_AGENT,
                'OS-Version': process.env.OS_VERSION,
                'X-Twitter-Client-Limit-Ad-Tracking': '1',
                'X-Twitter-API-Version': '5',
                'X-Twitter-Client': process.env.TWITTER_CLIENT
            }

        }
        responseJson = {}
        /**
         * @param body.flow_token
         * @param body.subtasks
         */
        return request(options).then(response => {
            body = JSON.parse(response.body);
            responseJson['user_id'] = body.subtasks[0]?.open_account?.user.id
            responseJson['screen_name'] = body.subtasks[0]?.open_account?.user.screen_name
            responseJson['phone_number'] = ''
            responseJson['password'] = ''
            responseJson['flow_token'] = body.flow_token
            responseJson['oauth_token'] = body.subtasks[0]?.open_account?.oauth_token
            responseJson['oauth_token_secret'] = body.subtasks[0]?.open_account?.oauth_token_secret
            responseJson['known_device_token'] = body.subtasks[0]?.open_account?.known_device_token
            responseJson['status'] = true
            return responseJson
        }).catch(function (err) {
            body = JSON.parse(err?.response.body);
            responseJson['status'] = false
            responseJson['code'] = body.errors[0]?.code
            responseJson['message'] = body.errors[0]?.message
            return responseJson
        });

    },
    createTweet: async function (ClientUUID, B3TraceId, user_info, message) {
        let statusJson = {
            "include_community_tweet_relationship": false,
            "include_conversation_context": false,
            "include_dm_muting": false,
            "include_professional": false,
            "include_tweet_quick_promote_eligibility": false,
            "include_type_name": false,
            "include_unmention_info_override": true,
            "include_view_count": false,
            "semantic_annotation_ids": [],
            "skip_author_community_relationship": true,
            "tweet_text": message
        }
        payload = {
            "features": "{\"birdwatch_consumption_enabled\":false,\"birdwatch_pivot_rating_form_enabled\":false,\"c9s_tweet_anatomy_moderator_badge_enabled\":false,\"creatorsde_collab_api_enabled\":true,\"edit_tweet_api_enabled\":true,\"graphql_unified_card_enabled\":true,\"identity_verification_ios_badging_enabled\":false,\"interactive_text_enabled\":true,\"ios_spaces_device_follow_enabled\":false,\"profile_foundations_has_spaces_graphql_enabled\":false,\"reactions_ios_prototype_version\":false,\"reply_voting_ios_experiment_version\":false,\"rito_safety_mode_features_enabled\":false,\"standardized_nudges_misinfo\":true,\"subscriptions_is_blue_verified_enabled\":true,\"super_follow_badge_privacy_enabled\":true,\"super_follow_exclusive_tweet_notifications_enabled\":true,\"super_follow_user_api_enabled\":true,\"trusted_friends_api_enabled\":true,\"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled\":false,\"tweet_with_visibility_results_prefer_gql_soft_interventions_enabled\":true,\"tweet_with_visibility_results_prefer_gql_tweet_interstitials_enabled\":true,\"tweetypie_unmention_optimization_enabled\":true,\"vibe_api_enabled\":true}",
            "variables": JSON.stringify(statusJson)
        }
        let options = {
            url: `https://na.glbtls.t.co/graphql/H2sliMqYYaqw9U-uClRSHg/CreateTweet`,
            body: JSON.stringify(payload),
            resolveWithFullResponse: true,
            oauth: {
                consumer_key: process.env.consumer_key,
                consumer_secret: process.env.consumer_secret,
                token: user_info.oauth_token,
                token_secret: user_info.oauth_token_secret
            },
            proxy: process.env.PROXY,
            method: "post",
            headers: {
                'User-Agent': process.env.SYSTEM_USER_AGENT,
                'X-Twitter-Client': process.env.TWITTER_CLIENT,
                'X-Twitter-Client-DeviceID': '00000000-0000-0000-0000-000000000000',
                'X-Twitter-Active-User': 'yes',
                'kdt': user_info.kdt,
                'X-Twitter-Client-Version': process.env.CLIENT_VERSION,
                'X-Twitter-Client-Limit-Ad-Tracking': '1',
                'X-B3-TraceId': B3TraceId,
                'Accept-Language': process.env.LANGUAGE,
                'Timezone': 'Europe/Istanbul',
                'X-Twitter-Client-Language': process.env.LANGUAGE,
                'X-Client-UUID': ClientUUID,
                'X-Twitter-API-Version': '5',
                'Accept': 'application/json',
                'Content-Type': 'application/json'


            }

        }

        responseJson = {}
        /**
         * @param body.data.create_tweet.tweet_result.result.legacy.created_at
         * @param body.data.create_tweet.tweet_result.result.legacy.full_text
         */
        return request(options).then(response => {
            body = JSON.parse(response.body);
            console.log(response.body)
            responseJson['status'] = true;
            return responseJson
        }).catch(function (err) {
            body = JSON.parse(err.response.body);
            responseJson['status'] = false
            responseJson['code'] = body.errors[0]?.code
            responseJson['message'] = body.errors[0]?.message
            return responseJson
        });

    },
    followCreate: async function (ClientUUID, B3TraceId, user_info, user) {
        payload = {
            "ext": "highlightedLabel,isBlueVerified,mediaColor",
            "handles_challenges": "1",
            "include_entities": "1",
            "include_ext_is_blue_verified": true,
            "include_profile_interstitial_type": true,
            "include_profile_location": true,
            "include_user_entities": true,
            "include_user_hashtag_entities": true,
            "include_user_mention_entities": true,
            "include_user_symbol_entities": true,
            "user_id": user
        }
        options = {
            url: `https://global.glbtls.t.co/1.1/friendships/create.json`,
            resolveWithFullResponse: true,
            form: {
                ext: "highlightedLabel,isBlueVerified,mediaColor",
                handles_challenges: "1",
                include_entities: "1",
                include_ext_is_blue_verified: true,
                include_profile_interstitial_type: true,
                include_profile_location: true,
                include_user_entities: true,
                include_user_hashtag_entities: true,
                include_user_mention_entities: true,
                include_user_symbol_entities: true,
                user_id: user
            },
            body: JSON.stringify(payload),
            oauth: {
                consumer_key: process.env.consumer_key,
                consumer_secret: process.env.consumer_secret,
                token: user_info.oauth_token,
                token_secret: user_info.oauth_token_secret
            },
            proxy: process.env.PROXY,
            method: "POST",
            headers: {
                'User-Agent': process.env.SYSTEM_USER_AGENT,
                'X-Twitter-Client': process.env.TWITTER_CLIENT,
                'X-Twitter-Client-DeviceID': '00000000-0000-0000-0000-000000000000',
                'X-Twitter-Active-User': 'yes',
                'kdt': user_info.kdt,
                'X-Twitter-Client-Version': process.env.CLIENT_VERSION,
                'X-Twitter-Client-Limit-Ad-Tracking': '1',
                'X-B3-TraceId': B3TraceId,
                'Accept-Language': process.env.LANGUAGE,
                'Timezone': 'Europe/Istanbul',
                'X-Twitter-Client-Language': process.env.LANGUAGE,
                'X-Client-UUID': ClientUUID,
                'X-Twitter-API-Version': '5',
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'

            }

        }

        responseJson = {}
        /**
         * @param body.data.create_tweet.tweet_result.result.legacy.created_at
         * @param body.data.create_tweet.tweet_result.result.legacy.full_text
         */
        return await request(options).then(response => {
            let body = JSON.parse(response.body);
            responseJson['status'] = true;
            return responseJson
        }).catch(function (err) {
            body = JSON.parse(err.response.body);
            responseJson['status'] = false
            responseJson['code'] = body.errors[0]?.code
            responseJson['message'] = body.errors[0]?.message
            return responseJson
        });

    },
    changePass: function (ClientUUID, B3TraceId, user_info, password) {

        let options = {
            url: `https://api.twitter.com/i/account/change_password.json`,
            form: {
                current_password: user_info.password,
                password: password,
                password_confirmation: password
            },
            resolveWithFullResponse: true,
            oauth: {
                consumer_key: process.env.consumer_key,
                consumer_secret: process.env.consumer_secret,
                token: user_info.oauth_token,
                token_secret: user_info.oauth_token_secret
            },
            proxy: process.env.PROXY,
            method: "post",
            headers: {
                'User-Agent': process.env.SYSTEM_USER_AGENT,
                'X-Twitter-Client': process.env.TWITTER_CLIENT,
                'X-Twitter-Client-DeviceID': '00000000-0000-0000-0000-000000000000',
                'X-Twitter-Active-User': 'yes',
                'kdt': user_info.kdt,
                'X-Twitter-Client-Version': process.env.CLIENT_VERSION,
                'X-Twitter-Client-Limit-Ad-Tracking': '1',
                'X-B3-TraceId': B3TraceId,
                'Accept-Language': process.env.LANGUAGE,
                'Timezone': 'Europe/Istanbul',
                'X-Twitter-Client-Language': process.env.LANGUAGE,
                'X-Client-UUID': ClientUUID,
                'X-Twitter-API-Version': '5',
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'


            }

        }

        responseJson = {}

        return request(options).then(response => {
            return JSON.parse(response.body)
        }).catch(function (err) {
            body = JSON.parse(err.response.body);
            responseJson['status'] = false
            responseJson['code'] = body.errors[0]?.code
            responseJson['message'] = body.errors[0]?.message
            return responseJson
        });

    },
    changeEmailTask: function (ClientUUID, B3TraceId, user_info) {
        payload = {
            "component_versions": {
                "spacer": 1,
                "progress_indicator": 1,
                "settings_group": 1,
                "card_wrapper": 1,
                "image": 1,
                "action": 1,
                "button": 1,
                "inline_callout": 1,
                "button_item": 1,
                "precise_location": 1,
                "tweet": 1,
                "inline_feedback": 1,
                "inline_tooltip": 1,
                "user": 1,
                "list": 1,
                "destructive_action": 1,
                "static_text": 1,
                "alert_example": 1,
                "boolean": 1,
                "info_item": 1,
                "toggle_wrapper": 1
            },
            "subtask_versions": {
                "enter_date": 1,
                "sign_up": 2,
                "enter_username": 3,
                "alert_dialog": 1,
                "choice_selection": 6,
                "privacy_options": 1,
                "user_recommendations_list": 5,
                "upload_media": 1,
                "tweet_selection_urt": 1,
                "action_list": 2,
                "update_users": 1,
                "select_banner": 2,
                "js_instrumentation": 1,
                "standard": 1,
                "settings_list": 7,
                "app_locale_update": 1,
                "open_home_timeline": 1,
                "generic_urt": 3,
                "wait_spinner": 3,
                "menu_dialog": 1,
                "open_account": 2,
                "single_sign_on": 1,
                "open_external_link": 1,
                "select_avatar": 4,
                "enter_password": 6,
                "cta": 7,
                "open_link": 1,
                "user_recommendations_urt": 4,
                "show_code": 1,
                "location_permission_prompt": 2,
                "sign_up_review": 5,
                "in_app_notification": 1,
                "security_key": 3,
                "phone_verification": 5,
                "contacts_live_sync_permission_prompt": 3,
                "check_logged_in_account": 1,
                "enter_phone": 2,
                "enter_text": 5,
                "enter_email": 2,
                "web_modal": 2,
                "notifications_permission_prompt": 4,
                "end_flow": 1,
                "alert_dialog_suppress_client_events": 1,
                "email_verification": 3
            }
        }
        let options = {
            url: `https://global.glbtls.t.co/1.1/onboarding/task.json?api_version=2&ext=highlightedLabel%2CisBlueVerified%2CmediaColor&flow_name=add_email&include_entities=1&include_ext_is_blue_verified=true&include_profile_interstitial_type=true&include_profile_location=true&include_user_entities=true&include_user_hashtag_entities=true&include_user_mention_entities=true&include_user_symbol_entities=true&known_device_token=${user_info.kdt}&sim_country_code=TR`,
            body: JSON.stringify(payload),
            resolveWithFullResponse: true,
            oauth: {
                consumer_key: process.env.consumer_key,
                consumer_secret: process.env.consumer_secret,
                token: user_info.oauth_token,
                token_secret: user_info.oauth_token_secret
            },
            proxy: process.env.PROXY,
            method: "post",
            headers: {
                'User-Agent': process.env.SYSTEM_USER_AGENT,
                'X-Twitter-Client': process.env.TWITTER_CLIENT,
                'X-Twitter-Client-DeviceID': '00000000-0000-0000-0000-000000000000',
                'X-Twitter-Active-User': 'yes',
                'kdt': user_info.kdt,
                'X-Twitter-Client-Version': process.env.CLIENT_VERSION,
                'X-Twitter-Client-Limit-Ad-Tracking': '1',
                'X-B3-TraceId': B3TraceId,
                'Accept-Language': process.env.LANGUAGE,
                'Timezone': 'Europe/Istanbul',
                'X-Twitter-Client-Language': process.env.LANGUAGE,
                'X-Client-UUID': ClientUUID,
                'X-Twitter-API-Version': '5',
                'Accept': 'application/json',
                'Content-Type': 'application/json'


            }

        }

        responseJson = {}
        /**
         * @param body.data.create_tweet.tweet_result.result.legacy.created_at
         * @param body.data.create_tweet.tweet_result.result.legacy.full_text
         */
        return request(options).then(response => {
            console.log(response.body);
            return response.body
        }).catch(function (err) {
            body = JSON.parse(err.response.body);
            responseJson['status'] = false
            responseJson['code'] = body.errors[0]?.code
            responseJson['message'] = body.errors[0]?.message
            return responseJson
        });

    },
    register_getFlow: function (ClientUUID, B3TraceId, ClientVendorID, GuestToken) {
        payload = {
            "subtask_versions": {
                "enter_date": 1,
                "sign_up": 2,
                "enter_username": 3,
                "alert_dialog": 1,
                "choice_selection": 6,
                "privacy_options": 1,
                "user_recommendations_list": 5,
                "upload_media": 1,
                "tweet_selection_urt": 1,
                "action_list": 2,
                "update_users": 1,
                "select_banner": 2,
                "js_instrumentation": 1,
                "standard": 1,
                "settings_list": 7,
                "app_locale_update": 1,
                "open_home_timeline": 1,
                "generic_urt": 3,
                "wait_spinner": 3,
                "menu_dialog": 1,
                "open_account": 2,
                "single_sign_on": 1,
                "open_external_link": 1,
                "select_avatar": 4,
                "enter_password": 6,
                "cta": 7,
                "open_link": 1,
                "user_recommendations_urt": 4,
                "show_code": 1,
                "location_permission_prompt": 2,
                "sign_up_review": 5,
                "in_app_notification": 1,
                "security_key": 3,
                "phone_verification": 5,
                "contacts_live_sync_permission_prompt": 3,
                "check_logged_in_account": 1,
                "enter_phone": 2,
                "enter_text": 5,
                "enter_email": 2,
                "web_modal": 2,
                "notifications_permission_prompt": 4,
                "end_flow": 1,
                "alert_dialog_suppress_client_events": 1,
                "email_verification": 3
            },
            "component_versions": {
                "spacer": 1,
                "progress_indicator": 1,
                "settings_group": 1,
                "card_wrapper": 1,
                "image": 1,
                "action": 1,
                "button": 1,
                "inline_callout": 1,
                "button_item": 1,
                "precise_location": 1,
                "tweet": 1,
                "inline_feedback": 1,
                "inline_tooltip": 1,
                "user": 1,
                "list": 1,
                "destructive_action": 1,
                "static_text": 1,
                "alert_example": 1,
                "boolean": 1,
                "info_item": 1,
                "toggle_wrapper": 1
            },
            "input_flow_data": {
                "flow_context": {
                    "start_location": {
                        "location": "splash_screen"
                    }
                }
            }
        }
        options = {
            url: 'https://api.twitter.com/1.1/onboarding/task.json?api_version=2&ext=mediaColor&flow_name=welcome&include_entities=1&include_profile_interstitial_type=true&include_profile_location=true&include_user_entities=true&include_user_hashtag_entities=true&include_user_mention_entities=true&include_user_symbol_entities=true&known_device_token=&sim_country_code=TR',
            proxy: process.env.PROXY,
            body: JSON.stringify(payload),
            resolveWithFullResponse: true,
            method: "post",
            headers: {
                'X-Twitter-Client-DeviceID': '00000000-0000-0000-0000-000000000000',
                'Accept': 'application/json',
                'X-Twitter-Client-Version': process.env.CLIENT_VERSION,
                'X-Guest-Token': GuestToken,
                'Twitter-Display-Size': '750x1334',
                'X-Twitter-Client-VendorID': ClientVendorID,
                'Authorization': process.env.AUTHORIZATION,
                'X-Client-UUID': ClientUUID,
                'X-Twitter-Client-Language': process.env.LANGUAGE,
                'X-B3-TraceId': B3TraceId,
                'Accept-Language': process.env.LANGUAGE,
                'Content-Type': 'application/json',
                'OS-Version': process.env.OS_VERSION,
                'User-Agent': process.env.USER_AGENT,
                'System-User-Agent': process.env.SYSTEM_USER_AGENT,
                'X-Twitter-Client-Limit-Ad-Tracking': '1',
                'X-Twitter-API-Version': '5',
                'X-Twitter-Client': process.env.TWITTER_CLIENT
            }

        }
        responseJson = {}
        /**
         * @param body.flow_token
         */
        return request(options).then(response => {
            body = JSON.parse(response.body);
            responseJson['status'] = true
            responseJson["flow_token"] = body.flow_token;
            return responseJson

        }).catch(function (err) {
            body = JSON.parse(err.response.body);
            responseJson['status'] = false
            responseJson['code'] = body.errors[0]?.code
            responseJson['message'] = body.errors[0]?.message
            return responseJson
        });

    },
    register_beginverification: function (ClientUUID, B3TraceId, ClientVendorID, GuestToken, flow_token, email, name) {
        payload = {
            "email": email,
            "display_name": name,
            "flow_token": flow_token,
            "use_voice": false
        }
        options = {
            url: 'https://api.twitter.com/1.1/onboarding/begin_verification.json',
            proxy: process.env.PROXY,
            body: JSON.stringify(payload),
            resolveWithFullResponse: true,
            method: "post",
            headers: {
                'X-Twitter-Client-DeviceID': '00000000-0000-0000-0000-000000000000',
                'Accept': 'application/json',
                'X-Twitter-Client-Version': process.env.CLIENT_VERSION,
                'X-Guest-Token': GuestToken,
                'Twitter-Display-Size': '750x1334',
                'X-Twitter-Client-VendorID': ClientVendorID,
                'Authorization': process.env.AUTHORIZATION,
                'X-Client-UUID': ClientUUID,
                'X-Twitter-Client-Language': process.env.LANGUAGE,
                'X-B3-TraceId': B3TraceId,
                'Accept-Language': process.env.LANGUAGE,
                'Content-Type': 'application/json',
                'OS-Version': process.env.OS_VERSION,
                'User-Agent': process.env.USER_AGENT,
                'System-User-Agent': process.env.SYSTEM_USER_AGENT,
                'X-Twitter-Client-Limit-Ad-Tracking': '1',
                'X-Twitter-API-Version': '5',
                'X-Twitter-Client': process.env.TWITTER_CLIENT
            }

        }
        responseJson = {}
        /**
         * @param body.flow_token
         */
        return request(options).then(response => {
            responseJson['status'] = true
            return responseJson

        }).catch(function (err) {
            body = JSON.parse(err.response.body);
            responseJson['status'] = false
            responseJson['code'] = body.errors[0]?.code
            responseJson['message'] = body.errors[0]?.message
            return responseJson
        });

    },
    register_task0: function (ClientUUID, B3TraceId, ClientVendorID, GuestToken, flow_token, email, js_instrumentation, name, code) {
        payload = {
            "flow_token": flow_token,
            "subtask_inputs": [{
                "subtask_id": "SplashScreenWithSso",
                "cta": {
                    "link": "signup",
                    "component_values": []
                }
            }, {
                "subtask_id": "WelcomeFlowStartSignupOpenLink",
                "open_link": {
                    "link": "welcome_flow_start_signup",
                    "component_values": []
                }
            }, {
                "subtask_id": "Signup",
                "sign_up": {
                    "email": email,
                    "js_instrumentation": {
                        "response": js_instrumentation
                    },
                    "name": name,
                    "birthday": {
                        "year": 1982,
                        "month": 12,
                        "day": 20
                    },
                    "link": "email_next_link"
                }
            }, {
                "subtask_id": "SignupSettingsListEmailNonEU",
                "settings_list": {
                    "link": "next_link",
                    "component_values": [],
                    "setting_responses": [{
                        "key": "twitter_for_web",
                        "response_data": {
                            "boolean_data": {
                                "result": false
                            }
                        }
                    }]
                }
            }, {
                "subtask_id": "SignupReview",
                "sign_up_review": {
                    "link": "signup_with_email_next_link",
                    "component_values": []
                }
            }, {
                "subtask_id": "EmailVerification",
                "email_verification": {
                    "code": code,
                    "component_values": [],
                    "email": email,
                    "link": "next_link"
                }
            }]
        }

        options = {
            url: 'https://api.twitter.com/1.1/onboarding/task.json?ext=mediaColor&include_entities=1&include_profile_interstitial_type=true&include_profile_location=true&include_user_entities=true&include_user_hashtag_entities=true&include_user_mention_entities=true&include_user_symbol_entities=true',
            //proxy: process.env.PROXY,
            body: JSON.stringify(payload),
            resolveWithFullResponse: true,
            method: "post",
            headers: {
                'X-Twitter-Client-DeviceID': '00000000-0000-0000-0000-000000000000',
                'Accept': 'application/json',
                'X-Originating-IP': '127.0.0.1, 77.67.121.13',
                'X-Twitter-Client-Version': process.env.CLIENT_VERSION,
                'X-Guest-Token': GuestToken,
                'Twitter-Display-Size': '750x1334',
                'X-Twitter-Client-VendorID': ClientVendorID,
                'Authorization': process.env.AUTHORIZATION,
                'X-Client-UUID': ClientUUID,
                'X-Twitter-Client-Language': process.env.LANGUAGE,
                'X-B3-TraceId': B3TraceId,
                'Accept-Language': process.env.LANGUAGE,
                'Content-Type': 'application/json',
                'OS-Version': process.env.OS_VERSION,
                'User-Agent': process.env.USER_AGENT,
                'System-User-Agent': process.env.SYSTEM_USER_AGENT,
                'X-Twitter-Client-Limit-Ad-Tracking': '1',
                'X-Twitter-API-Version': '5',
                'X-Twitter-Client': process.env.TWITTER_CLIENT
            }

        }
        responseJson = {}
        /**
         * @param body.flow_token
         */
        return request(options).then(response => {
            body = JSON.parse(response.body);
            subtask_id = body.subtasks[0]?.subtask_id
            responseJson['status'] = true
            responseJson["flow_token"] = body.flow_token;
            responseJson["subtask_id"] = subtask_id
            return responseJson

        }).catch(function (err) {
            body = JSON.parse(err.response.body);
            responseJson['status'] = false
            responseJson['code'] = body.errors[0]?.code
            responseJson['message'] = body.errors[0]?.message
            return responseJson
        });

    },
    register_task1: function (ClientUUID, B3TraceId, ClientVendorID, GuestToken, flow_token, password) {
        payload = {
            "flow_token": flow_token,
            "subtask_inputs": [{
                "subtask_id": "EnterPassword",
                "enter_password": {
                    "link": "next_link",
                    "component_values": [],
                    "password": password
                }
            }]
        }
        options = {
            url: 'https://api.twitter.com/1.1/onboarding/task.json?ext=mediaColor&include_entities=1&include_profile_interstitial_type=true&include_profile_location=true&include_user_entities=true&include_user_hashtag_entities=true&include_user_mention_entities=true&include_user_symbol_entities=true',
            proxy: process.env.PROXY,
            body: JSON.stringify(payload),
            resolveWithFullResponse: true,
            method: "post",
            headers: {
                'X-Twitter-Client-DeviceID': '00000000-0000-0000-0000-000000000000',
                'Accept': 'application/json',
                'X-Twitter-Client-Version': process.env.CLIENT_VERSION,
                'X-Guest-Token': GuestToken,
                'Twitter-Display-Size': '750x1334',
                'X-Twitter-Client-VendorID': ClientVendorID,
                'Authorization': process.env.AUTHORIZATION,
                'X-Client-UUID': ClientUUID,
                'X-Twitter-Client-Language': process.env.LANGUAGE,
                'X-B3-TraceId': B3TraceId,
                'Accept-Language': process.env.LANGUAGE,
                'Content-Type': 'application/json',
                'OS-Version': process.env.OS_VERSION,
                'User-Agent': process.env.USER_AGENT,
                'System-User-Agent': process.env.SYSTEM_USER_AGENT,
                'X-Twitter-Client-Limit-Ad-Tracking': '1',
                'X-Twitter-API-Version': '5',
                'X-Twitter-Client': process.env.TWITTER_CLIENT
            }

        }
        responseJson = {}
        /**
         * @param body.flow_token
         */
        return request(options).then(response => {
            body = JSON.parse(response.body);
            subtask_id = body.subtasks[0]?.subtask_id
            responseJson['status'] = true
            responseJson["flow_token"] = body.flow_token;
            responseJson["subtask_id"] = subtask_id
            responseJson['user_id'] = body.subtasks[0]?.open_account?.user.id
            responseJson['screen_name'] = body.subtasks[0]?.open_account?.user.screen_name
            responseJson['password'] = ''
            responseJson['oauth_token'] = body.subtasks[0]?.open_account?.oauth_token
            responseJson['oauth_token_secret'] = body.subtasks[0]?.open_account?.oauth_token_secret
            responseJson['known_device_token'] = body.subtasks[0]?.open_account?.known_device_token
            return responseJson

        }).catch(function (err) {
            body = JSON.parse(err.response.body);
            responseJson['status'] = false
            responseJson['code'] = body.errors[0]?.code
            responseJson['message'] = body.errors[0]?.message
            return responseJson
        });

    }
}

module.exports = requests