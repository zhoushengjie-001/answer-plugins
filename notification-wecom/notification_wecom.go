package wecom

import (
  "embed"
  "github.com/apache/incubator-answer/plugin"
  "github.com/go-resty/resty/v2"
  "strings"

  "github.com/apache/incubator-answer-plugins/util"
  wecomI18n "github.com/lhui/incubator-answer-plugins/notification-wecom/i18n"
  "github.com/segmentfault/pacman/i18n"
  "github.com/segmentfault/pacman/log"
)

//go:embed  info.yaml
var Info embed.FS

type Notification struct {
	Config          *NotificationConfig
	UserConfigCache *UserConfigCache
}

func init() {
	uc := &Notification{
		Config:          &NotificationConfig{},
		UserConfigCache: NewUserConfigCache(),
	}
	plugin.Register(uc)
}
func (*Notification) Info() plugin.Info {
  info := &util.Info{}
	info.GetInfo(Info)

  return plugin.Info{
    Name:        plugin.MakeTranslator(wecomI18n.InfoName),
    SlugName:    info.SlugName,
    Description: plugin.MakeTranslator(wecomI18n.InfoDescription),
    Author:      info.Author,
    Version:     info.Version,
    Link:        info.Link,
  }
}



// GetNewQuestionSubscribers returns the subscribers of the new question notification
func (n *Notification) GetNewQuestionSubscribers() (userIDs []string) {
	for userID, conf := range n.UserConfigCache.userConfigMapping {
		if conf.AllNewQuestions {
			userIDs = append(userIDs, userID)
		}
	}
	return userIDs
}

// Notify sends a notification to the user
func (n *Notification) Notify(msg plugin.NotificationMessage) {
	log.Debugf("try to send notification %+v", msg)

	if !n.Config.Notification {
		return
	}

	// get user config
	userConfig, err := n.getUserConfig(msg.ReceiverUserID)
	if err != nil {
		log.Errorf("get user config failed: %v", err)
		return
	}
	if userConfig == nil {
		log.Debugf("user %s has no config", msg.ReceiverUserID)
		return
	}

	// check if the notification is enabled
	switch msg.Type {
	case plugin.NotificationNewQuestion:
		if !userConfig.AllNewQuestions {
			log.Debugf("user %s not config the new question", msg.ReceiverUserID)
			return
		}
	case plugin.NotificationNewQuestionFollowedTag:
		if !userConfig.NewQuestionsForFollowingTags {
			log.Debugf("user %s not config the new question followed tag", msg.ReceiverUserID)
			return
		}
	default:
		if !userConfig.InboxNotifications {
			log.Debugf("user %s not config the inbox notification", msg.ReceiverUserID)
			return
		}
	}

	log.Debugf("user %s config the notification", msg.ReceiverUserID)

	if len(userConfig.WebhookURL) == 0 {
		log.Errorf("user %s has no webhook url", msg.ReceiverUserID)
		return
	}

	notificationMsg:= renderNotification(msg)
	// no need to send empty message
	if len(notificationMsg) == 0 {
		log.Debugf("this type of notification will be drop, the type is %s", msg.Type)
		return
	}

	// Create a Resty Client
	client := resty.New()
	resp, err := client.R().
		SetHeader("Content-Type", "application/json").
		SetBody(NewWebhookReq(notificationMsg)).
		Post(userConfig.WebhookURL)

	if err != nil {
		log.Errorf("send message failed: %v %v", err, resp)
	} else {
		log.Infof("send message to %s success, resp: %s", msg.ReceiverUserID, resp.String())
	}
}

func renderNotification(msg plugin.NotificationMessage) (string) {
	lang := i18n.Language(msg.ReceiverLang)
	switch msg.Type {
	case plugin.NotificationUpdateQuestion:
		return plugin.TranslateWithData(lang, wecomI18n.TplUpdateQuestion, msg)
	case plugin.NotificationAnswerTheQuestion:
		return plugin.TranslateWithData(lang, wecomI18n.TplAnswerTheQuestion, msg)
	case plugin.NotificationUpdateAnswer:
		return plugin.TranslateWithData(lang, wecomI18n.TplUpdateAnswer, msg)
	case plugin.NotificationAcceptAnswer:
		return plugin.TranslateWithData(lang, wecomI18n.TplAcceptAnswer, msg)
	case plugin.NotificationCommentQuestion:
		return plugin.TranslateWithData(lang, wecomI18n.TplCommentQuestion, msg)
	case plugin.NotificationCommentAnswer:
		return plugin.TranslateWithData(lang, wecomI18n.TplCommentAnswer, msg)
	case plugin.NotificationReplyToYou:
		return plugin.TranslateWithData(lang, wecomI18n.TplReplyToYou, msg)
	case plugin.NotificationMentionYou:
		return plugin.TranslateWithData(lang, wecomI18n.TplMentionYou, msg)
	case plugin.NotificationInvitedYouToAnswer:
		return plugin.TranslateWithData(lang, wecomI18n.TplInvitedYouToAnswer, msg)
	case plugin.NotificationNewQuestion, plugin.NotificationNewQuestionFollowedTag:
		msg.QuestionTags = strings.Join(strings.Split(msg.QuestionTags, ","), ", ")
		return plugin.TranslateWithData(lang, wecomI18n.TplNewQuestion, msg)
	}
	return ""
}

