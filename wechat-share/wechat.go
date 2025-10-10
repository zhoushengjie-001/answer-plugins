package wechat_share

import (
	"embed"
	"encoding/json"

	"github.com/apache/answer-plugins/util"
	"github.com/gin-gonic/gin"

	"github.com/apache/answer/plugin"
	"github.com/zhoushengjie-001/answer-plugins/wechat-share/i18n"
)

//go:embed info.yaml
var Info embed.FS

//go:embed components
var Build embed.FS

type WechatShare struct {
	Config *WechatShareConfig
}

type WechatShareConfig struct {
	Wechat bool `json:"wechat"`
}

func init() {
	plugin.Register(&WechatShare{
		Config: &WechatShareConfig{},
	})
}

func (w *WechatShare) Info() plugin.Info {
	info := &util.Info{}
	info.GetInfo(Info)

	return plugin.Info{
		Name:        plugin.MakeTranslator(i18n.InfoName),
		SlugName:    info.SlugName,
		Description: plugin.MakeTranslator(i18n.InfoDescription),
		Author:      info.Author,
		Version:     info.Version,
		Link:        info.Link,
	}
}

func (w *WechatShare) ConfigFields() []plugin.ConfigField {
	return []plugin.ConfigField{
		{
			Name:  "Wechat",
			Type:  plugin.ConfigTypeSwitch,
			Title: plugin.MakeTranslator(i18n.ConfigWechatTitle),
			UIOptions: plugin.ConfigFieldUIOptions{
				Label:          plugin.MakeTranslator(i18n.ConfigWechatLabel),
				FieldClassName: "mb-0",
			},
			Value: w.Config.Wechat,
		},
	}
}

func (w *WechatShare) ConfigReceiver(config []byte) error {
	c := &WechatShareConfig{}
	if err := json.Unmarshal(config, c); err != nil {
		return err
	}
	w.Config = c
	return nil
}

func (w *WechatShare) Embed(c *gin.Context) {
	c.JSON(200, gin.H{
		"data": map[string]interface{}{
			"wechat": w.Config.Wechat,
		},
	})
}
